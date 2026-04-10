// maps API label to something human-readable and a colour class
const SENTIMENT_META = {
  positive: { display: "Positive", colorClass: "sentiment-positive" },
  negative: { display: "Negative", colorClass: "sentiment-negative" },
  neutral:  { display: "Neutral",  colorClass: "sentiment-neutral"  },
};

export default function ResultCard({ result }) {
  const { sentiment, image_description, caption_used } = result;
  const meta = SENTIMENT_META[sentiment.label] ?? SENTIMENT_META.neutral;
  const confidence = Math.round(sentiment.score * 100);

  return (
    <div className="result-card">
      <h2 className="result-title">Results</h2>

      <section className="result-section">
        <span className="result-label">Image description</span>
        <p className="result-value">{image_description}</p>
      </section>

      <section className="result-section">
        <span className="result-label">Text analysed</span>
        <p className="result-value result-caption-used">{caption_used}</p>
      </section>

      <section className="result-section sentiment-row">
        <span className="result-label">Sentiment</span>
        <div className="sentiment-badge-wrap">
          <span className={`sentiment-badge ${meta.colorClass}`}>
            {meta.display}
          </span>
          <span className="confidence">{confidence}% confidence</span>
        </div>
      </section>
    </div>
  );
}
