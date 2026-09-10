import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./components/animations/ScrollReveal";
import codexDark from "./assets/codex_dark.png";
import codexLight from "./assets/code_light.png";
import bgLogo from "./assets/bg_logo.png";

// â”€â”€â”€ Reduced-motion guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// â”€â”€â”€ Staggered character reveal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const chars = text.split("");
  return (
    <span className={className} aria-label={text}>
      {prefersReduced
        ? text
        : chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "inline-block",
                whiteSpace: char === " " ? "pre" : "normal",
              }}
            >
              {char}
            </motion.span>
          ))}
    </span>
  );
}

// â”€â”€â”€ Typing effect hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useTypingEffect(text: string, startDelay: number, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [text, startDelay, speed]);

  return { displayed, done };
}

// â”€â”€â”€ Sonar pulse button / link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SonarButton({
  children,
  className,
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const pulse = !prefersReduced && (
    <motion.span
      className="absolute inset-0 pointer-events-none"
      style={{ border: "2px solid #00B4D8" }}
      animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeOut",
        repeatDelay: 0.5,
      }}
    />
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`relative ${className ?? ""}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
        {pulse}
      </motion.a>
    );
  }
  return (
    <motion.button
      onClick={onClick}
      className={`relative ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
      {pulse}
    </motion.button>
  );
}

// â”€â”€â”€ Floating code fragment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function FloatingCode({
  text,
  x,
  y,
  duration,
  delay,
}: {
  text: string;
  x: string;
  y: string;
  duration: number;
  delay: number;
}) {
  if (prefersReduced) return null;
  return (
    <motion.div
      className="absolute font-mono text-xs font-bold bg-slate-900 text-white px-2 py-1 pointer-events-none select-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -20, 5, -12, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
        repeatType: "mirror",
      }}
    >
      {text}
    </motion.div>
  );
}

// â”€â”€â”€ Orientation Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OrientationNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "#domains", label: "Domains" },
    { href: "#timeline", label: "Timeline" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <motion.nav
      initial={prefersReduced ? {} : { y: "-100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      style={{
        backgroundColor: scrolled ? "rgba(179, 229, 252, 0.85)" : undefined,
        backdropFilter: scrolled ? "blur(10px)" : undefined,
        transition: "background-color 300ms ease, backdrop-filter 300ms ease",
        willChange: "transform",
      }}
      className={`sticky top-0 z-50 border-b-4 border-slate-900 px-6 py-4 ${
        scrolled ? "" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="https://codex-iter.in" className="flex items-center gap-2">
          <div className="p-1">
            <img src={codexDark} alt="CODEX ITER Logo" className="h-10 w-9"  loading="lazy" />
          </div>
          <span
            className={`text-2xl font-black tracking-tighter transition-colors text-slate-900`}
          >
            CODEX ITER
          </span>
        </a>

        {/* Desktop links */}
        <motion.div
          className="hidden md:flex items-center gap-10"
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
            >
              <a
                href={link.href}
                className={`font-bold transition-colors relative py-1 group text-slate-900 hover:text-primary`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-200" />
              </a>
            </motion.div>
          ))}

          <motion.a
            href="https://www.codex-iter.in/"
            target="_blank"
            rel="noopener noreferrer"
            initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#F53D8A] text-white px-6 py-2 font-bold brutalist-shadow border-2 border-slate-900 transition-colors hover:brightness-110 cursor-pointer"
          >
            Main Website
          </motion.a>
        </motion.div>

        {/* Hamburger */}
        <button
          id="nav-menu-toggle"
          className={`md:hidden flex items-center justify-center cursor-pointer transition-colors ${
            scrolled ? "text-white" : "text-slate-900"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-3xl">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden"
          >
            <div
              className={`mt-4 pt-4 border-t-4 border-slate-900 flex flex-col gap-4 ${
                scrolled ? "border-white/20" : ""
              }`}
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-bold hover:text-primary transition-colors px-2 py-1 ${
                    scrolled ? "text-white" : "text-slate-900"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://www.codex-iter.in/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="bg-primary text-white px-6 py-3 font-bold brutalist-shadow border-2 border-slate-900 transition-all hover:bg-white hover:text-slate-900 w-full mt-2 text-center"
              >
                Main Website
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// â”€â”€â”€ FAQ Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-4 border-slate-900 brutalist-shadow bg-white cursor-pointer"
      whileHover={
        prefersReduced
          ? {}
          : { x: -2, y: -2, boxShadow: "6px 6px 0px 0px #03045E" }
      }
      transition={{ duration: 0.15 }}
      onClick={() => setOpen(!open)}
      role="button"
      aria-expanded={open}
      id={`faq-item-${index}`}
    >
      <div className="flex items-center justify-between p-6 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-sm font-bold text-primary shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide leading-tight">
            {question}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-primary shrink-0 text-2xl"
        >
          add
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t-4 border-slate-900">
              <p className="text-slate-700 font-medium leading-relaxed pt-4 text-base">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// â”€â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Footer() {
  return (
    <footer className="bg-background-dark text-black py-20 px-6 border-t-4 border-slate-900">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">
        {/* Logo + description */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="p-1">
                <img src={codexLight} alt="CODEX ITER Logo" className="h-10 w-9"  loading="lazy" />
              </div>
            </motion.div>
            <span className="text-3xl font-black tracking-tighter">CODEX ITER</span>
          </div>
          <p className="text-black max-w-md font-medium text-lg leading-relaxed">
            A student-led engineering organization dedicated to technological excellence,
            open-source innovation, and building the future of the web.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <h5 className="font-black text-xl mb-6 uppercase tracking-widest text-[#0707F2]">
            Navigate
          </h5>
          <ul className="space-y-4 font-bold">
            {[
              { href: "https://codex-iter.in", label: "THE JOURNEY" },
              { href: "https://codex-iter.in/blogs", label: "THE ARCHIVE" },
              { href: "https://codex-iter.in/events", label: "CURRENT OPS" },
              { href: "https://codex-iter.in/team", label: "THE SQUAD" },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h5 className="font-black text-xl mb-6 uppercase tracking-widest text-[#0707F2]">
            Connect
          </h5>
          <div className="flex gap-4">
            {[
              {
                icon: <Linkedin size={24} />,
                href: "https://www.linkedin.com/company/codex-iter",
                id: "linkedin",
              },
              {
                icon: <Mail size={24} />,
                href: "mailto:codexiter@gmail.com",
                id: "email",
              },
              {
                icon: <Instagram size={24} />,
                href: "https://www.instagram.com/codexiter",
                id: "instagram",
              },
            ].map(({ icon, href, id }) => (
              <motion.a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ rotate: 15, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="bg-white text-slate-900 p-2 border-2 border-primary hover:bg-primary hover:text-white transition-colors flex cursor-pointer"
              >
                {icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-black font-mono text-sm relative z-10">
        <p className="text-sm text-center">
          Â© 2026 CODEX ITER. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}

// â”€â”€â”€ Static data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ACADEMIC_ARCHIVES = [
  { title: "1st Year Syllabus", desc: "Complete curriculum breakdown and reference material for freshmen.", btn: "Download" },
  { title: "2nd Year Syllabus", desc: "Advanced engineering modules and core branch subjects.", btn: "Download" },
  { title: "PYQ Database", desc: "Access the repository of previous year questions across all semesters.", btn: "Access Repository" },
];

const TECH_TRACK = [
  { title: "AI / ML", desc: "Artificial Intelligence & Machine Learning" },
  { title: "IoT & Cybersec", desc: "Internet of Things & Cybersecurity" },
  { title: "Web & App Dev", desc: "Full-Stack Engineering" },
  { title: "Cloud & DevOps", desc: "Infrastructure and Deployment" },
];

const CREATIVE_TRACK = [
  { title: "Graphic Designers", desc: "UI/UX & Branding" },
  { title: "Video Editors", desc: "Motion Graphics & Media" },
  { title: "Content Writers", desc: "Technical & Creative Copy" },
];

const OPS_TRACK = [
  { title: "PR, Management & Outreach", desc: "Event coordination, sponsorships, public relations" },
];

const STATS = [
  {
    value: "50+",
    label: "Active Projects & Mentorships",
    bg: "bg-background-light",
    valueCls: "text-primary",
    labelCls: "text-slate-900",
    span: 1,
  },
  {
    value: "150+",
    label: "Flagship Hackathons Won",
    bg: "bg-primary",
    valueCls: "text-white",
    labelCls: "text-white/90",
    span: 1,
  },
  {
    value: "1,000,000+",
    label: "Lines of Open Source Code",
    bg: "bg-slate-900",
    valueCls: "text-white",
    labelCls: "text-white/80",
    span: 2,
  },
];

type TimelinePhase = {
  phase: string;
  title: string;
  date: string;
  desc: string;
  icon: string;
  color: string;
  accent: string;
  textAccent: string;
  isWarning?: boolean;
};

const TECH_TIMELINE: TimelinePhase[] = [
  {
    phase: "01",
    title: "Online Quiz Round",
    date: "TBA",
    desc: "Core CS fundamentals",
    icon: "terminal",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  },
  {
    phase: "02",
    title: "Offline Coding Round",
    date: "TBA",
    desc: "Algorithmic problem solving",
    icon: "code",
    color: "bg-primary",
    accent: "text-white",
    textAccent: "text-white",
  },
  {
    phase: "03",
    title: "Interview Round",
    date: "TBA",
    desc: "Technical and HR discussion",
    icon: "groups",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  }
];

const NON_TECH_TIMELINE: TimelinePhase[] = [
  {
    phase: "00",
    title: "Portfolio Submission",
    date: "TBA",
    desc: "Showcase your past work and creativity.",
    isWarning: true,
    icon: "palette",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  },
  {
    phase: "01",
    title: "Quiz Round",
    date: "TBA",
    desc: "Aptitude and domain knowledge",
    icon: "edit_note",
    color: "bg-primary",
    accent: "text-white",
    textAccent: "text-white",
  },
  {
    phase: "02",
    title: "Interview Round",
    date: "TBA",
    desc: "Portfolio review and HR discussion",
    icon: "groups",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  }
];

const FAQS = [
  {
    question: "Do I need prior coding experience to apply?",
    answer:
      "No prior experience is required for most of our wings. We value curiosity and a willingness to learn over existing skill level. That said, competitive programming and AI/ML wings may expect some foundational comfort with programming logic. Our orientation session will help you find the right fit.",
  },
  {
    question: "What is the expected time commitment?",
    answer:
      "Most members dedicate 6â€“10 hours per week on average. This includes weekly domain meetings, project work, and optional workshops or events. During hackathon season it may be more â€” but it's always opt-in based on your bandwidth.",
  },
  {
    question: "Can students from all branches apply?",
    answer:
      "Absolutely. CODEX ITER is open to all undergraduate students of ITER, regardless of branch. We have members from CSE, ECE, Mechanical, Civil, and beyond. Diverse perspectives make our work stronger.",
  },
  {
    question: "Will I work on real projects or just learn theory?",
    answer:
      "Real projects, always. From day one you'll be contributing to active repositories, collaborating with seniors, and shipping work that may go live on our platform or in partner organizations. Theory is delivered through workshops alongside hands-on execution.",
  },
  {
    question: "Is there a fee to join CODEX ITER?",
    answer:
      "There is no fee to apply or join. CODEX ITER is a student-run, merit-based organization. Events and workshops hosted throughout the year are free for all members.",
  },
  {
    question: "What happens after I complete the technical task?",
    answer:
      "All submitted tasks are reviewed by domain leads within 3â€“5 days. Every applicant receives feedback regardless of outcome. Selected candidates are invited to an informal conversation before the final induction announcement.",
  },
];


// â”€â”€â”€ Notepad Viewer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NotepadViewer() {
  const [activeYear, setActiveYear] = useState("1st Year");
  
  const MOCK_SYLLABUS: Record<string, string[]> = {
    "1st Year": [
      "Engineering Mathematics - I & II",
      "Basic Electrical Engineering",
      "Programming in C / C++",
      "Engineering Physics / Chemistry",
      "Communication Skills"
    ],
    "2nd Year": [
      "Data Structures and Algorithms",
      "Object Oriented Programming (Java)",
      "Digital Logic Design",
      "Discrete Mathematics",
      "Computer Organization & Architecture"
    ]
  };

  const years = Object.keys(MOCK_SYLLABUS);

  return (
    <div className="bg-[#FFF9C4] border-4 border-slate-900 brutalist-shadow flex flex-col h-full relative" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #B3E5FC 31px, #B3E5FC 32px)", backgroundSize: "100% 32px", backgroundPosition: "0 8px" }}>
      {/* Header/Tabs */}
      <div className="flex border-b-4 border-slate-900 bg-white flex-wrap">
        {years.map(year => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={`flex-1 py-3 px-2 font-bold font-mono border-r-4 border-slate-900 last:border-r-0 transition-colors whitespace-nowrap ${activeYear === year ? "bg-[#0707f2] text-white" : "bg-white text-slate-900 hover:bg-slate-100"}`}
          >
            {year}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-8 flex-grow font-mono text-slate-900 text-lg leading-[32px]">
        <ul className="list-disc pl-6">
          {MOCK_SYLLABUS[activeYear].map((item, idx) => (
            <li key={idx} className="mb-0">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main App Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App() {
  const [activeTrack, setActiveTrack] = useState<'tech' | 'non-tech'>('tech');
  const HERO_TITLE = "CODEX";
  const HERO_SUB1 = "START";
  const HERO_SUB2 = "2026";

  const subheadDelay =
    0.3 + HERO_TITLE.length * 0.04 + 0.5 + 400;
  const { displayed, done } = useTypingEffect(
    "Welcome freshmen and sophomore developers. Join a powerhouse of technical innovation.",
    subheadDelay
  );

  const CHAR_COUNT = (HERO_TITLE + " " + HERO_SUB1 + " " + HERO_SUB2).length;
  const ctaDelay = 0.3 + CHAR_COUNT * 0.04 + 0.8;

  return (
    <>
      <Helmet>
        <title>CODEX ITER | Recruitment 2026 â€” Orientation Portal</title>
        <meta
          name="description"
          content="Apply to join CODEX ITER Intake 2026. Explore our domains, track the recruitment roadmap, and register for the orientation session."
        />
        <meta
          name="keywords"
          content="CODEX ITER recruitment 2026, orientation, join coding club, ITER Bhubaneswar"
        />
        <link rel="canonical" href="https://orientation.codex-iter.in" />
        <meta property="og:title" content="CODEX ITER | Recruitment 2026" />
        <meta
          property="og:description"
          content="Join CODEX ITER â€” a decade of technical culture. Recruitment open for Intake 2026."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* â”€â”€ NAVBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <OrientationNavbar />

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden border-b-4 border-slate-900"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.6) 2.5px, transparent 2.5px), linear-gradient(135deg, #FCB6D1 0%, #B3E5FC 25%, #B3E5FC 100%)",
          backgroundSize: "28px 28px, cover",
          backgroundPosition: "center, center",
        }}
      >
        {/* Centered Background Logo */}
        <img
          src={bgLogo}
          alt="Background Logo"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[750px] pointer-events-none select-none z-0"
          style={{ opacity: 0.35 }}
         loading="lazy" />

        {/* Legacy Theme Transition Overlay (Original codex-main theme) */}
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ clipPath: "circle(150% at 100% 0%)" }}
          animate={{ clipPath: "circle(0% at 100% 0%)" }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          style={{
            backgroundColor: "#CAF0F8",
            backgroundImage: "radial-gradient(#03045E 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-30">
            <img src={codexDark} alt="CODEX" className="h-60 w-60 drop-shadow-xl"  loading="lazy" />
            <div className="mt-8 font-mono text-xl font-bold tracking-widest text-[#03045E]">INITIALIZING...</div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full py-20 relative z-10">
          {/* Left: copy */}
          <div className="relative z-10">
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-block bg-[#C4DFED] text-slate-900 px-4 py-1 font-bold mb-6 text-sm uppercase tracking-widest font-mono"
            >
              RECRUITMENT // INTAKE 2026
            </motion.div>

            <h1 className="text-5xl md:text-[5rem] font-black leading-[1.1] text-white drop-shadow-md mb-6 font-display py-2">
              <span className="text-[#0707F2]">
                <AnimatedHeading text={HERO_TITLE} />
              </span>
              {" "}
              <br />
              <span className="text-[#0707F2] italic drop-shadow-none">
                <AnimatedHeading text={HERO_SUB1} />
              </span>{" "}
              <br />
              <AnimatedHeading text={HERO_SUB2} />
            </h1>

            <p className="text-xl text-slate-900 max-w-lg mb-10 leading-relaxed font-sans min-h-[80px]">
              {displayed}
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="ml-0.5 inline-block w-0.5 h-5 bg-primary"
                />
              )}
            </p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: ctaDelay / 1000 }}
            >
              <SonarButton
                href="#register"
                className="bg-[#F53D8A] text-white px-8 py-4 text-lg font-black border-2 border-slate-900 font-display tracking-widest cursor-pointer uppercase inline-block text-center hover:brightness-110 transition-all"
              >
                Register Now
              </SonarButton>
              <motion.a
                href="#timeline"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-transparent text-slate-900 px-8 py-4 text-lg font-black border-2 border-white font-display tracking-widest cursor-pointer uppercase drop-shadow-sm backdrop-blur-sm"
              >
                View Timeline
              </motion.a>
            </motion.div>
          </div>

          {/* Right: SpideyTracker Embed */}
          <motion.div
            className="relative w-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0"
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-2xl">
              {/* Tilted background layer */}
              <motion.div
                className="absolute inset-0 bg-primary/20 border-4 border-slate-900 brutalist-shadow"
                animate={{ rotate: [3, 4, 3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Tracker container */}
              <div className="relative bg-[#C4DFED] border-4 border-slate-900 brutalist-shadow -rotate-2 flex flex-col overflow-hidden w-full">
                {/* Chrome bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b-4 border-slate-900 bg-[#C4DFED] shrink-0">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  <span className="ml-3 font-mono text-xs text-slate-900 font-bold tracking-widest uppercase">
                    codex_tracker.exe
                  </span>
                </div>
                {/* SpideyTracker iframe */}
                <div className="relative w-full overflow-hidden" style={{ height: "640px" }}>
                  <iframe
                    src="/SpideyTracker/index.html"
                    title="CODEX Tracker"
                    id="codex-tracker-frame"
                    className="absolute inset-0 w-full h-full border-0"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                    }}
                    allow="geolocation"
                    loading="lazy"
                    onLoad={(e) => {
                      // Auto-click Sound Off to bypass the intro screen
                      try {
                        const iframe = e.currentTarget as HTMLIFrameElement;
                        const doc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (!doc) return;
                        const tryClick = () => {
                          const btn = doc.querySelector<HTMLButtonElement>('[data-sound-enabled="false"]');
                          if (btn) { btn.click(); return; }
                          const soundOptIn = doc.getElementById('sound-opt-in');
                          if (soundOptIn && !soundOptIn.style.display?.includes('none') && !soundOptIn.classList.contains('sound-opt-in--hidden')) {
                            setTimeout(tryClick, 300);
                          }
                        };
                        setTimeout(tryClick, 1500);
                      } catch (_) {}
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ IMPACT STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-24 bg-white border-b-4 border-slate-900">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12">
            <ScrollReveal className="lg:col-span-5">
              <h2 className="text-5xl font-black text-slate-900 mb-8 uppercase font-display leading-[1.1]">
                A Community<br />
                Built on{" "}
                <span className="text-primary underline">Results</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-700 leading-relaxed font-sans">
                <p>
                  CODEX ITER isn't just a club â€” it's an ecosystem. In ten years we've
                  launched startups, won national hackathons, and shipped open-source
                  projects used by thousands.
                </p>
                <p>
                  When you join, you inherit a decade of collective knowledge, a
                  senior-to-junior mentorship culture, and direct access to builders
                  who are actively shipping.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="lg:col-span-7 grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <StaggerItem key={i} className={stat.span === 2 ? "col-span-2" : ""}>
                  <div
                    className={`p-8 border-4 border-slate-900 brutalist-shadow h-full ${stat.bg}`}
                  >
                    <div
                      className={`text-5xl font-black mb-2 font-display ${stat.valueCls}`}
                    >
                      {stat.value}
                    </div>
                    <div
                      className={`font-bold uppercase tracking-wide text-sm ${stat.labelCls}`}
                    >
                      {stat.label}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* â”€â”€ ACADEMIC ARCHIVES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-24 bg-white border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl font-bold uppercase border-b-4 border-black inline-block mb-8 font-display"> // ACADEMIC_ARCHIVES </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StaggerItem className="lg:col-span-2 h-full">
              <NotepadViewer />
            </StaggerItem>
            
            <StaggerItem className="lg:col-span-1 h-full">
              <div className="relative bg-[#C4DFED] border-4 border-slate-900 brutalist-shadow p-8 flex flex-col h-full hover:-translate-y-2 transition-transform duration-200">
                <div className="absolute top-4 right-4 font-mono text-xl text-slate-900 opacity-20 font-bold">&lt;/&gt;</div>
                <h3 className="text-2xl font-black mb-4 uppercase font-display text-slate-900">PYQ Database</h3>
                <p className="font-medium text-slate-800 text-sm leading-relaxed mb-8 flex-grow">Access the repository of previous year questions across all semesters.</p>
                <button className="bg-[#F53D8A] text-white border-2 border-slate-900 py-3 font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[4px_4px_0px_0px_#0f172a] active:shadow-none active:translate-y-1 active:translate-x-1">
                  Access Repository
                </button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* â”€â”€ OPEN RECRUITMENT TRACKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="domains" className="py-24 bg-background-light border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl font-black uppercase mb-10 text-slate-900 font-display"> // OPEN_RECRUITMENT_TRACKS </h2>
          </ScrollReveal>

          {/* TECH TRACK */}
          <div className="mb-16">
            <ScrollReveal>
              <h3 className="font-mono font-bold text-slate-900 mb-6 bg-slate-200 inline-block px-3 py-1 border-2 border-slate-900">[ CATEGORY: TECH ]</h3>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECH_TRACK.map((role, i) => (
                <StaggerItem key={i} className="h-full">
                  <div className="bg-white border-4 border-slate-900 p-6 flex flex-col h-full brutalist-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                    <span className="inline-block text-xs bg-slate-900 text-white px-2 py-1 font-mono uppercase tracking-widest mb-4 w-max border-2 border-slate-900">STATUS: HIRING</span>
                    <h4 className="text-xl font-black uppercase font-display text-slate-900 mb-2">{role.title}</h4>
                    <p className="text-sm font-medium text-slate-700">{role.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* CREATIVE TRACK */}
          <div className="mb-16">
            <ScrollReveal>
              <h3 className="font-mono font-bold text-slate-900 mb-6 bg-slate-200 inline-block px-3 py-1 border-2 border-slate-900">[ CATEGORY: CREATIVE & MEDIA ]</h3>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREATIVE_TRACK.map((role, i) => (
                <StaggerItem key={i} className="h-full">
                  <div className="bg-[#FCB6D1] border-4 border-slate-900 p-6 flex flex-col h-full brutalist-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                    <span className="inline-block text-xs bg-slate-900 text-white px-2 py-1 font-mono uppercase tracking-widest mb-4 w-max border-2 border-slate-900">STATUS: HIRING</span>
                    <h4 className="text-xl font-black uppercase font-display text-slate-900 mb-2">{role.title}</h4>
                    <p className="text-sm font-medium text-slate-800">{role.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* OPS TRACK */}
          <div>
            <ScrollReveal>
              <h3 className="font-mono font-bold text-slate-900 mb-6 bg-slate-200 inline-block px-3 py-1 border-2 border-slate-900">[ CATEGORY: OPERATIONS ]</h3>
            </ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {OPS_TRACK.map((role, i) => (
                <StaggerItem key={i} className="lg:col-span-1 h-full">
                  <div className="bg-[#C4DFED] border-4 border-slate-900 p-6 flex flex-col h-full brutalist-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200">
                    <span className="inline-block text-xs bg-slate-900 text-white px-2 py-1 font-mono uppercase tracking-widest mb-4 w-max border-2 border-slate-900">STATUS: HIRING</span>
                    <h4 className="text-xl font-black uppercase font-display text-slate-900 mb-2">{role.title}</h4>
                    <p className="text-sm font-medium text-slate-800">{role.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* â”€â”€ TIMELINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section
        id="timeline"
        className="py-24 bg-white border-b-4 border-slate-900 scroll-mt-20"
      >
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-16">
              <h2 className="text-5xl font-black text-slate-900 uppercase leading-none font-display">
                Recruitment
                <br />
                <span className="text-primary">Roadmap</span>
              </h2>
              <div className="hidden md:block text-right font-mono font-bold text-slate-900 opacity-60">
                // INDUCTION PHASES
              </div>
            </div>
          </ScrollReveal>

          {/* Neo-Brutalist Toggle Tabs */}
          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            <button 
              onClick={() => setActiveTrack('tech')}
              className={`flex-1 font-mono text-xl font-bold uppercase tracking-widest border-4 border-slate-900 py-4 px-6 transition-all ${activeTrack === 'tech' ? 'bg-[#F53D8A] text-white translate-x-1 translate-y-1 shadow-none' : 'bg-[#C4DFED] text-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]'}`}
            >
              [ TECH_TRACK ]
            </button>
            <button 
              onClick={() => setActiveTrack('non-tech')}
              className={`flex-1 font-mono text-xl font-bold uppercase tracking-widest border-4 border-slate-900 py-4 px-6 transition-all ${activeTrack === 'non-tech' ? 'bg-[#F53D8A] text-white translate-x-1 translate-y-1 shadow-none' : 'bg-[#C4DFED] text-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]'}`}
            >
              [ NON_TECH_TRACK ]
            </button>
          </div>

          <div className="relative">
            {/* Vertical connector */}
            <div className="hidden md:block absolute left-[calc(2.5rem_-_2px)] top-0 bottom-0 w-1 bg-slate-900" />

            <StaggerContainer className="space-y-8" key={activeTrack}>
              {(activeTrack === 'tech' ? TECH_TIMELINE : NON_TECH_TIMELINE).map((phase, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-6 md:gap-10 items-start">
                    {/* Phase badge */}
                    <div
                      className={`shrink-0 w-20 h-20 border-4 border-slate-900 brutalist-shadow flex flex-col items-center justify-center font-mono z-10 ${phase.color}`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${phase.accent}`}
                      >
                        Phase
                      </span>
                      <span
                        className={`text-2xl font-black font-display ${phase.accent}`}
                      >
                        {phase.phase}
                      </span>
                    </div>

                    {/* Card */}
                    <motion.div
                      className="flex-1 border-4 border-slate-900 brutalist-shadow bg-white p-6"
                      whileHover={
                        prefersReduced
                          ? {}
                          : { x: 4, boxShadow: "8px 8px 0px 0px #03045E" }
                      }
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-primary">
                            {phase.icon}
                          </span>
                          <h3 className="text-2xl font-black uppercase font-display text-slate-900">
                            {phase.title}
                          </h3>
                        </div>
                        <span className="font-mono text-xs font-bold text-primary bg-background-light px-3 py-1 border-2 border-primary whitespace-nowrap shrink-0">
                          {phase.date}
                        </span>
                      </div>
                      {phase.isWarning && (
                        <div className="mb-4 mt-2">
                          <span className="text-xs bg-[#F53D8A] text-white px-2 py-1 font-mono border border-black inline-block shadow-[2px_2px_0px_rgba(0,0,0,1)]">REQUIRED FOR DESIGNERS & VIDEO EDITORS</span>
                        </div>
                      )}
                      <p className="text-slate-700 font-medium leading-relaxed text-sm">
                        {phase.desc}
                      </p>
                    </motion.div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section
        id="faq"
        className="py-24 bg-background-light border-b-4 border-slate-900 scroll-mt-20"
      >
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-16">
              <h2 className="text-5xl font-black text-slate-900 uppercase leading-none font-display">
                Got
                <br />
                <span className="text-primary">Questions?</span>
              </h2>
              <div className="hidden md:block text-right font-mono font-bold text-slate-900 opacity-60">
                // FAQ
              </div>
            </div>
          </ScrollReveal>

          <StaggerContainer className="space-y-4">
            {FAQS.map((faq, i) => (
              <StaggerItem key={i}>
                <FAQItem question={faq.question} answer={faq.answer} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* â”€â”€ FINAL CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ScrollReveal>
        <section id="register" className="bg-primary py-24 scroll-mt-20 relative">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-block bg-white text-primary px-4 py-1 font-bold mb-8 text-sm uppercase tracking-widest font-mono brutalist-shadow border-2 border-slate-900">
              Applications Open â€” Intake 2026
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-8 uppercase leading-none italic font-display">
              Join The Codex.
            </h2>
            <p className="text-2xl font-bold text-white/90 mb-12 max-w-2xl mx-auto">
              Register for the orientation session and take the first step into a
              decade-long legacy of technical excellence.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <SonarButton
                href="https://forms.gle/"
                className="bg-white text-slate-900 px-12 py-6 text-xl md:text-2xl font-black border-4 border-slate-900 w-full md:w-auto font-display tracking-widest uppercase cursor-pointer inline-block text-center"
              >
                REGISTER NOW
              </SonarButton>
              <motion.a
                href="https://whatsapp.com/channel/0029Vb7SavAElagvuWq2i10a"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-slate-900 text-white px-12 py-6 text-xl md:text-2xl font-black border-4 border-slate-900 w-full md:w-auto font-display tracking-widest uppercase cursor-pointer text-center"
              >
                JOIN OUR CHANNEL
              </motion.a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Footer />
    </>
  );
}


