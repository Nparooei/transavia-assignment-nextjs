"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import styles from "./error.module.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.page}>
      <section className={styles.card} role="alert" aria-labelledby="error-title">
        <p className={styles.eyebrow}>Something went wrong</p>
        <h1 id="error-title">We could not load your flight search</h1>
        <p className={styles.message}>
          Please try again. Your current URL will stay the same, so you will not lose your search.
        </p>
        <Button onPress={reset}>Try again</Button>
      </section>
    </main>
  );
}
