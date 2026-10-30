import { Link } from "@tanstack/react-router";
import type { Coffee } from "../../../core/coffees/model";
import { formatPrice } from "../../../common/format";
import styles from "./coffee-card.module.css";

interface Props {
  coffee: Coffee;
  onAdd: (coffee: Coffee) => void;
}

export function CoffeeCard({ coffee, onAdd }: Props) {
  return (
    <li className={styles.card}>
      <div>
        <h2 className={styles.name}>
          <Link to="/coffees/$coffeeId" params={{ coffeeId: String(coffee.id) }}>
            {coffee.name}
          </Link>
        </h2>
        <p className={styles.origin}>{coffee.origin}</p>
      </div>
      <p className={styles.price}>{formatPrice(coffee.price)}</p>
      <button
        className={styles.add}
        aria-label={`Añadir ${coffee.name} al carrito`}
        onClick={() => onAdd(coffee)}
      >
        Añadir al carrito
      </button>
    </li>
  );
}
