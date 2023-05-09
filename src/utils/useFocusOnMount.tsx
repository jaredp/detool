import { useRef, useEffect } from "react";

export const useRefAndFocus = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) {
      const el = ref.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (el) {
        (el as HTMLElement).focus();
      }
    }
  }, []);
  return ref;
};

export const FocusOnMount = (props: { children: React.ReactNode }) => {
  const ref = useRefAndFocus<HTMLDivElement>();
  return <div ref={ref}>{props.children}</div>;
};
