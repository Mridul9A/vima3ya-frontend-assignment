import { useEffect } from "react";

export default function useScrollTracker(sectionRefs, setActiveSections) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setActiveSections((prev) => {
          let updated = [...prev];

          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.index);

            if (entry.isIntersecting && !updated.includes(index)) {
              updated.push(index);
            }
          });

          return updated.sort();
        });
      },
      { threshold: 0.4 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);
}