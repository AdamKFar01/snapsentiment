import SentimentGauge from "./SentimentGauge";

export default function ResultCard({ preview, filename, data }) {
  const { sentiment, image_description, caption_used } = data;
  // only show the caption row when the user supplied their own text
  const userSuppliedCaption = caption_used !== image_description;

  return (
    <article className="result-card">
      <div className="result-image-wrap">
        <img src={preview} alt={filename} className="result-image" />
      </div>

      <div className="result-body">
        <section className="result-section">
          <span className="result-label">Image description</span>
          <p className="result-value">{image_description}</p>
        </section>

        {userSuppliedCaption && (
          <section className="result-section">
            <span className="result-label">Caption analysed</span>
            <p className="result-value result-caption">{caption_used}</p>
          </section>
        )}

        <SentimentGauge label={sentiment.label} score={sentiment.score} />
      </div>
    </article>
  );
}
