import layoutStyles from "@/components/layout/page-layout/page-layout.module.css";
import styles from "./page-footer.module.css";

export function PageFooter() {
  return (
    <footer className={`${styles.footer} ${layoutStyles.shell}`}>
      <span>Transavia flight finder</span>
      <span>Interview assignment · provided data set</span>
    </footer>
  );
}
