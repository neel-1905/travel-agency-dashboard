const InfoPill = (props: InfoPillProps) => {
  const { image, text } = props;
  return (
    <figure className="info-pill">
      <img src={image} alt={text} />

      <figcaption>{text}</figcaption>
    </figure>
  );
};

export default InfoPill;
