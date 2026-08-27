"""Optional analytics worker for academic and extracurricular trend forecasts.

Input: JSON array of records on stdin, each with category, date, and score.
Output: JSON array with the original records and a forecast score per category.
"""
import json
import sys
from datetime import date

from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline


def forecast(records, category):
    items = [item for item in records if item.get("category") == category]
    if len(items) < 3:
        return {"category": category, "forecast": None, "reason": "at least 3 observations required"}

    x = [[index] for index in range(len(items))]
    y = [float(item["score"]) for item in items]
    model = make_pipeline(
        StandardScaler(),
        MLPRegressor(hidden_layer_sizes=(8, 4), max_iter=1000, random_state=7),
    )
    model.fit(x, y)
    prediction = max(0.0, min(100.0, float(model.predict([[len(items)]])[0])))
    return {"category": category, "forecast": round(prediction, 2), "asOf": date.today().isoformat()}


def main():
    records = json.load(sys.stdin)
    print(json.dumps({
        "forecasts": [forecast(records, "academic"), forecast(records, "extracurricular")],
        "records": records,
    }))


if __name__ == "__main__":
    main()
