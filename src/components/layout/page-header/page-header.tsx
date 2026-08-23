import { Icon } from "@/components/ui/icon/icon";
import layoutStyles from "@/components/layout/page-layout/page-layout.module.css";
import { Typography } from "@/components/ui/typography/typography";
import styles from "./page-header.module.css";

export function PageHeader() {
  return (
    <header className={styles.hero} id="top">
      <nav
        className={`${styles.nav} ${layoutStyles.shell}`}
        aria-label="Main navigation"
      >
        <a
          className={styles.brand}
          href="#top"
          aria-label="Transavia flight finder home"
        >
          <span className={styles.brandMark}>
            <Icon name="plane" />
          </span>
          <span>transavia</span>
        </a>
        <span className={styles.navNote}>Flight finder</span>
      </nav>
      <div className={`${styles.heroCopy} ${layoutStyles.shell}`}>
        <Typography variant="eyebrow">Ready when you are</Typography>
        <Typography as="h1" variant="hero">
          Where will you go next?
        </Typography>
        <Typography variant="body">
          Search our available flights from Amsterdam and start looking forward to your
          trip.
        </Typography>
      </div>
    </header>
  );
}
