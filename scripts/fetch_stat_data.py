"""Build the dashboard dataset from public stat.gov.kz downloads."""

from __future__ import annotations

import io
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import openpyxl

HEADERS = {"User-Agent": "QazaqDataDashboard/1.0 (+https://github.com/Magzhan713/qazaq-regions-passport)"}
POPULATION_URL = "https://stat.gov.kz/api/iblock/element/6645/json/file/kk/"
BIRTHS_URL = "https://stat.gov.kz/api/iblock/element/6633/json/file/kk/"
DEATHS_URL = "https://stat.gov.kz/api/iblock/element/6630/json/file/kk/"
TELECOM_PAGE = "https://stat.gov.kz/ru/industries/business-statistics/stat-it/spreadsheets/"


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def json_download(url: str):
    return json.loads(download(url).decode("utf-8-sig"))


def latest_period(record: dict) -> dict:
    return max(record["periods"], key=lambda item: datetime.strptime(item["date"], "%d.%m.%Y"))


def total_record(records: list[dict]) -> dict:
    # Official datasets list the country total first. Prefer the record with
    # all dimensions set to the same total IDs as the first record.
    first = records[0]
    total_dims = first["terms"][1:]
    return next((r for r in records if r["terms"][1:] == total_dims), first)


def extract_demography() -> dict:
    population = json_download(POPULATION_URL)
    births = json_download(BIRTHS_URL)
    deaths = json_download(DEATHS_URL)

    country = total_record(population)
    latest = latest_period(country)
    series = sorted(country["periods"], key=lambda item: datetime.strptime(item["date"], "%d.%m.%Y"))
    latest_year = int(latest["date"][-4:])
    previous = next((p for p in series if p["date"].endswith(str(latest_year - 1))), None)
    population_value = int(float(latest["value"]))
    growth = ((population_value / int(float(previous["value"]))) - 1) * 100 if previous else None

    total_dims = country["terms"][1:]
    regions = []
    for record in population:
        if record["terms"][1:] != total_dims or record["terms"][0] == country["terms"][0]:
            continue
        item = latest_period(record)
        if item["date"] != latest["date"]:
            continue
        regions.append({"name": record["termNames"][0].title(), "value": int(float(item["value"]))})
    regions.sort(key=lambda item: item["value"], reverse=True)

    def current_value(records: list[dict]) -> tuple[int, str]:
        country_records = [record for record in records if record["terms"][0] == country["terms"][0]]
        candidates = [(latest_period(record), record) for record in country_records]
        item, _ = max(candidates, key=lambda pair: int(float(pair[0]["value"])))
        return int(float(item["value"])), item["date"]

    births_value, births_date = current_value(births)
    deaths_value, deaths_date = current_value(deaths)

    return {
        "population": population_value,
        "populationGrowth": round(growth, 2) if growth is not None else None,
        "populationDate": latest["date"],
        "births": births_value,
        "birthsDate": births_date,
        "deaths": deaths_value,
        "deathsDate": deaths_date,
        "naturalIncrease": births_value - deaths_value,
        "series": [{"year": int(p["date"][-4:]), "value": int(float(p["value"]))} for p in series[-12:]],
        "regions": regions,
    }


def find_latest_telecom_url() -> str:
    html = download(TELECOM_PAGE).decode("utf-8", errors="replace")
    links = re.findall(r'href=["\']([^"\']*/api/iblock/element/\d+/file/ru/)["\']', html)
    if not links:
        # The first current release as of the initial implementation. This is
        # only a fallback; the listing is checked on every run.
        return "https://stat.gov.kz/api/iblock/element/346476/file/ru/"
    url = links[0]
    return url if url.startswith("http") else f"https://stat.gov.kz{url}"


def extract_telecom() -> dict:
    url = find_latest_telecom_url()
    workbook = openpyxl.load_workbook(io.BytesIO(download(url)), data_only=True, read_only=True)
    values: dict[str, float] = {}
    report_period = ""
    for sheet in workbook.worksheets:
        for row in sheet.iter_rows(values_only=True):
            first = row[0] if row else None
            if isinstance(first, str):
                if not report_period and "2026" in first and ("месяц" in first.lower() or "январ" in first.lower()):
                    report_period = first.strip()
                key = first.strip().lower()
                numeric = next((value for value in row[1:] if isinstance(value, (int, float))), None)
                if numeric is None:
                    continue
                if key == "объем услуг связи":
                    values.setdefault("marketVolumeMln", float(numeric))
                elif key.startswith("число абонентов сотовой связи,") or key == "число абонентов сотовой связи":
                    values.setdefault("mobileSubscribersThousand", float(numeric))
                elif key == "число абонентов фиксированного интернета":
                    values.setdefault("fixedInternetThousand", float(numeric))
                elif key.startswith("плотность абонентов сотовой связи на 100"):
                    values.setdefault("mobileDensity", float(numeric))
                elif "абонентов сотовой связи, имеющих доступ к сети интернет" in key:
                    values.setdefault("mobileInternetThousand", float(numeric))

    required = {"marketVolumeMln", "mobileSubscribersThousand", "fixedInternetThousand", "mobileDensity"}
    missing = required - values.keys()
    if missing:
        raise RuntimeError(f"Telecom workbook format changed; missing: {sorted(missing)}")
    values.update({"sourceUrl": url, "reportPeriod": report_period or "Последняя официальная публикация"})
    return values


def main() -> None:
    output = {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "source": "Бюро национальной статистики Республики Казахстан",
            "sourceUrl": "https://stat.gov.kz/",
            "live": True,
        },
        "demography": extract_demography(),
        "telecom": extract_telecom(),
    }
    path = Path("public/data/statistics.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {path}")


if __name__ == "__main__":
    main()
