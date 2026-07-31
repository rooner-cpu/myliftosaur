import type { JSX } from "react";

interface IProps {
  maxWidth?: number;
}

const footerLinks: [string, string][] = [
  ["Source Code", "https://github.com/rooner-cpu/myliftosaur"],
  ["Docs", "/doc"],
  ["Web Editor", "/planner"],
  ["1RM Calculator", "/one-rep-max-calculator"],
  ["Your Programs", "/user/programs"],
  ["Blog", "/blog"],
  ["Exercises", "/exercises"],
  ["Terms & Conditions", "/terms.html"],
  ["Privacy", "/privacy.html"],
  ["Licenses & Attribution", "/licenses.html"],
];

export function FooterPage(props: IProps): JSX.Element {
  const maxWidth = props.maxWidth != null ? `${props.maxWidth}px` : "800px";
  return (
    <footer className="mt-8 ">
      <div style={{ backgroundColor: "#28204B" }}>
        <div className="px-6 mx-auto" style={{ maxWidth }}>
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">
            <div className="hidden pt-8 md:block shrink-0">
              <img src="/images/vmr-lift-logo.webp" alt="" style={{ height: "200px" }} />
            </div>

            <div className="shrink-0">
              <div className="pt-8 text-3xl font-bold text-text-alwayswhite md:pt-0">VMR-Lift</div>
              <div className="mt-4 text-sm text-text-alwayswhite">
                Questions?{" "}
                <a href="mailto:rooner@gmail.com" className="text-purple-300 underline">
                  rooner@gmail.com
                </a>
              </div>
            </div>

            <div className="flex-1 mt-8 md:mt-0 md:flex md:justify-end">
              <div className="footer-links-grid gap-x-10 gap-y-3">
                {footerLinks.map(([text, link]) => (
                  <a
                    key={text}
                    className="text-sm text-gray-300 no-underline hover:text-text-alwayswhite"
                    href={link}
                    target={link.startsWith("http") ? "_blank" : undefined}
                  >
                    {text}
                  </a>
                ))}
                <a
                  className="text-sm text-gray-300 no-underline cursor-pointer hover:text-text-alwayswhite"
                  href="#privacy-settings"
                  onClick={(e) => {
                    e.preventDefault();
                    (window as unknown as { lftConsent?: { open: () => void } }).lftConsent?.open();
                  }}
                >
                  Privacy Settings
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 md:hidden">
            <img src="/images/vmr-lift-logo.webp" alt="" style={{ height: "200px" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}

