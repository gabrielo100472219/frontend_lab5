import { useEffect, useState } from "react";

const offerSeconds = 15 * 60;

const twoDigits = (value: number) => String(value).padStart(2, "0");

export function OfferCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(offerSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (secondsLeft === 0) {
    return (
      <p className="font-semibold">La oferta de envío gratis ha terminado.</p>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <p className="font-semibold">
      🎉 Envío gratis: quedan{" "}
      <time dateTime={`PT${minutes}M${seconds}S`}>
        {twoDigits(minutes)}:{twoDigits(seconds)}
      </time>
    </p>
  );
}
