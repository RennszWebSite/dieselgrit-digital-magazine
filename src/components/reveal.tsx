import { useInView } from "@/lib/motion";
import type { ReactNode, ElementType, CSSProperties } from "react";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

/** Masked upward reveal. Wrap headlines, dek, buttons, etc. */
export function Reveal({ as: Tag = "span", children, delay = 0, className = "", style }: RevealProps) {
  const ref = useInView<HTMLElement>();
  return (
    <Tag ref={ref as never} className={`dg-reveal ${className}`} style={style}>
      <span className="dg-reveal-inner" style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </span>
    </Tag>
  );
}

/** Clip-path image reveal wrapper. */
export function ClipReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`dg-clip ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}