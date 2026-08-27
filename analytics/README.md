# Optional analytics worker

`forecast.py` is an optional Python MLP worker. It accepts normalized records on stdin and emits academic and extracurricular next-point forecasts as JSON.

The Next.js dashboard remains deployable on Vercel without this worker: its two charts are rendered from the persisted marks and extracurricular records returned by the Java API. Deploy this worker separately when forecast scores are required, then expose its output through the backend.

```sh
pip install -r requirements.txt
printf '%s' '[{"category":"academic","score":72},{"category":"academic","score":78},{"category":"academic","score":84}]' | python forecast.py
```
