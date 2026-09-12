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
    { href: "#syllabus", label: "Syllabus" },
    { href: "#pyq", label: "PYQ" },
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
  { title: "IoT & Cybersecurity", desc: "Connected systems, security, and smart hardware" },
  { title: "Web Dev & App Dev", desc: "Modern web products and mobile experiences" },
  { title: "Data Science", desc: "Analytics, insights, and intelligent problem solving" },
];

const NON_TECH_TRACK = [
  { title: "Graphic Designers", desc: "Brand identity, posters, marketing visuals, and UI assets" },
  { title: "Video Editors", desc: "Editing, motion graphics, and visual storytelling" },
  { title: "Content Writers", desc: "Creative and technical storytelling for the club" },
  { title: "PR, Management & Outreach", desc: "Events, sponsorships, communication, and community building" },
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
    desc: "A timed aptitude and logic-based screening to assess your core technical foundation.",
    icon: "terminal",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  },
  {
    phase: "02",
    title: "Offline Coding Round",
    date: "TBA",
    desc: "Hands-on algorithmic problem solving and implementation under real-time conditions.",
    icon: "code",
    color: "bg-primary",
    accent: "text-white",
    textAccent: "text-white",
  },
  {
    phase: "03",
    title: "Interview Round",
    date: "TBA",
    desc: "Technical discussion, communication assessment, and final selection interview.",
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
    desc: "Required for designers and video editors to showcase their previous work and creative potential.",
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
    desc: "Aptitude, domain awareness, and creativity-focused screening for non-technical roles.",
    icon: "edit_note",
    color: "bg-primary",
    accent: "text-white",
    textAccent: "text-white",
  },
  {
    phase: "02",
    title: "Interview Round",
    date: "TBA",
    desc: "Portfolio review and personal interaction to evaluate fit, creativity, and collaboration.",
    icon: "groups",
    color: "bg-background-light",
    accent: "text-primary",
    textAccent: "text-slate-900",
  }
];

const FAQS = [
  {
    question: "Who is eligible?",
    answer: "All students from first and second year only are eligible for participation.",
  },
  {
    question: "How difficult is the entrance test?",
    answer: "The difficulty level has been curated keeping in mind the skills and syllabus of first and second year students.",
  },
  {
    question: "I am an ECE student. Can I participate?",
    answer: "Programming skills are a must at Codex, but there is no restriction for branch.",
  },
  {
    question: "Do I need my own laptop for participation?",
    answer: "Yes, participants must use their own laptops for the 1st technical round.",
  },
  {
    question: "What topics do I need to know?",
    answer: "Please refer to the topics page.",
  },
  {
    question: "What programming languages are allowed?",
    answer: "You can use any programming language, but second years must be proficient in Java.",
  },
  {
    question: "If I don't have any coding skills what do I do?",
    answer: "You can apply for non-tech roles such as designers and editors but should have a drive to learn code at the same time.",
  },
];

const SYLLABUS_BY_YEAR: Record<string, Array<{ topic: string; level: string }>> = {
  "First Year": [
    { topic: "Datatypes & Variables", level: "Advanced" },
    { topic: "Conditional Statements", level: "Advanced" },
    { topic: "Operators & Modifiers", level: "Advanced" },
    { topic: "Loops", level: "Intermediate" },
    { topic: "Strings & Arrays", level: "Intermediate" },
    { topic: "Classes & Objects", level: "Beginner" },
    { topic: "Recursion", level: "Beginner" },
  ],
  "Second Year": [
    { topic: "Core Java", level: "Advanced" },
    { topic: "Arrays & Strings", level: "Advanced" },
    { topic: "Classes & Objects", level: "Advanced" },
    { topic: "Data Structures - LinkedList, Stacks, Queues, Trees", level: "Intermediate" },
    { topic: "Algorithms", level: "Beginner" },
  ],
};

const RULES = [
  "We here at Codex are very passionate about our coding prowess. We leave no opportunity to flaunt our coding skills to others.",
  "Once you get yourself registered, join the group for further details so you don't miss any updates.",
  "Each round is an elimination round, so if you are really interested in joining us, you need to appear and perform in every round.",
  "Ranking of individuals is based on the platform leaderboard and discussion with the judging panel.",
  "Winners and positions on the leaderboard may change if someone develops an exceptional and highly optimized logic within the time limit.",
  "AI tools, tab switching, and any external assistance are strictly prohibited during the Quiz Round. Violations may lead to immediate disqualification.",
  "There are some restrictions for and during the test process, such as the use of AI tools and auto-code completions, which are to be totally avoided as the code may be reviewed afterwards and may lead to cancellation of the candidature.",
  "No one would be entertained as a special case if they missed any updates; the organizing team is not responsible for them."
];

// â”€â”€â”€ Notepad Viewer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NotepadViewer() {
  const [activeYear, setActiveYear] = useState("First Year");
  const years = Object.keys(SYLLABUS_BY_YEAR);

  return (
    <div
      className="bg-[#FFF9C4] border-4 border-slate-900 brutalist-shadow flex flex-col h-full relative"
      style={{
        backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #B3E5FC 31px, #B3E5FC 32px)",
        backgroundSize: "100% 32px",
        backgroundPosition: "0 8px",
      }}
    >
      <div className="flex border-b-4 border-slate-900 bg-white flex-wrap">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={`flex-1 py-3 px-2 font-bold font-mono border-r-4 border-slate-900 last:border-r-0 transition-colors whitespace-nowrap ${
              activeYear === year ? "bg-[#0707f2] text-white" : "bg-white text-slate-900 hover:bg-slate-100"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="p-8 md:p-10 flex-grow font-mono text-slate-900 leading-[32px]">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="font-bold uppercase tracking-[0.18em] text-xs text-slate-700">
            What I Need to Know
          </div>
          <div className="bg-white border-2 border-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
            {activeYear}
          </div>
        </div>

        <div className="overflow-hidden border-2 border-slate-900 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#C4DFED] border-b-2 border-slate-900">
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-900">
                  Topic
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-900">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {SYLLABUS_BY_YEAR[activeYear].map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F5F7FF]"}>
                  <td className="px-4 py-3 text-base font-medium text-slate-800 border-t-2 border-slate-900/60">
                    {item.topic}
                  </td>
                  <td className="px-4 py-3 text-base font-black text-primary border-t-2 border-slate-900/60 uppercase tracking-wide">
                    {item.level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        className="relative min-h-[72vh] flex items-center overflow-hidden border-b-4 border-slate-900"
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

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center w-full py-10 relative z-10">
          {/* Left: copy */}
          <div className="relative z-10">
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-block bg-[#C4DFED] text-slate-900 px-4 py-1 font-bold mb-6 text-sm uppercase tracking-widest font-mono"
            >
              RECRUITMENT // HIRING 2026
            </motion.div>

            <div className="mb-5 flex flex-wrap items-center gap-3 uppercase text-[0.62rem] md:text-[0.74rem] font-black tracking-[0.22em] text-slate-900">
              <span className="inline-flex items-center rounded-full border-2 border-slate-900 bg-white px-3 py-1 shadow-[4px_4px_0_#0707F2]">
                recruitment 2026
              </span>
              <span className="inline-flex items-center rounded-full border-2 border-slate-900 bg-[#C4DFED] px-3 py-1 shadow-[4px_4px_0_#F53D8A]">
                build • create • grow
              </span>
            </div>

            <div className="relative mb-6">
              <div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-[#F53D8A]/30 blur-3xl" />
              <div className="absolute right-4 top-0 h-20 w-20 rounded-full bg-[#0707F2]/20 blur-3xl" />

              <h1 className="relative font-display leading-[0.7] tracking-[-0.08em] text-white uppercase">
                <div className="flex items-end gap-3 md:gap-5" style={{ transform: "skewY(-2deg)" }}>
                  <span className="relative inline-block text-[#0707F2] text-[3.2rem] md:text-[6.8rem] font-black drop-shadow-[9px_9px_0_rgba(245,61,138,0.25)]">
                    <AnimatedHeading text={HERO_TITLE} />
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 md:gap-3 uppercase" style={{ transform: "skewY(-2deg)" }}>
                  <span className="relative inline-block text-[#0707F2] text-[2.5rem] md:text-[5.2rem] font-black italic leading-none drop-shadow-[7px_7px_0_rgba(245,61,138,0.2)]">
                    <AnimatedHeading text={HERO_SUB1} />
                  </span>

                  <div className="flex items-center -ml-1 md:-ml-2">
                    <span className="relative inline-flex items-center justify-center rounded-xl border-2 border-slate-900 bg-[#F53D8A] px-2 py-1 text-[1.35rem] md:text-[2.7rem] font-black text-white shadow-[5px_5px_0_#0707F2] leading-none">
                      20
                    </span>
                    <span className="flex items-center justify-center -mx-1.5 md:-mx-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-900" />
                      <span className="h-[0.18rem] w-4 md:w-5 rounded-full bg-slate-900" />
                      <span className="h-2 w-2 rounded-full bg-slate-900" />
                    </span>
                    <span className="relative inline-flex items-center justify-center rounded-xl border-2 border-slate-900 bg-[#C4DFED] px-2 py-1 text-[1.35rem] md:text-[2.7rem] font-black text-[#0707F2] shadow-[5px_5px_0_#F53D8A] leading-none -ml-1.5 md:-ml-2">
                      26
                    </span>
                  </div>
                </div>
              </h1>
            </div>

            <p className="text-lg text-slate-900 max-w-lg mb-8 leading-relaxed font-sans min-h-[52px]">
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
                href="https://forms.gle/exrCRqSNMF9gfWuF9"
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
                  CODEX ITER isn't just a club — it's a community of builders. We turn
                  ideas into projects, projects into experience, and experience into impact.
                </p>
                <p>
                  Join a culture of mentorship, execution, and innovation where senior and
                  junior members grow together and build the future side by side.
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
      <section id="syllabus" className="py-24 bg-white border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-3xl font-bold uppercase border-b-4 border-black inline-block font-display"> // ACADEMIC_ARCHIVES </h2>
              <div className="inline-block bg-[#C4DFED] text-slate-900 px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.2em] border-2 border-slate-900">
                1st & 2nd Year
              </div>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1">
            <StaggerItem className="h-full">
              <NotepadViewer />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* â”€â”€ PRACTICE MAKES PERFECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="pyq" className="py-14 bg-background-light border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-5 relative z-10">
          <ScrollReveal>
            <div className="mb-8 text-center">
              <div className="inline-block bg-white text-slate-900 px-3 py-1 font-bold mb-4 text-xs uppercase tracking-widest font-mono border-2 border-slate-900">
                Practice Makes Perfect
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-900 font-display leading-none mb-4">
                Previous Year Questions
              </h2>
              <p className="text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Get a head start on your preparation by checking past questions and understanding the exam pattern and difficulty level.
              </p>
            </div>
          </ScrollReveal>

          <div className="bg-white border-4 border-slate-900 brutalist-shadow p-5 md:p-7 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-2xl font-black uppercase font-display text-slate-900 mb-3">Access Previous Year Questions</h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-5 max-w-xl mx-auto">
              Review past questions to understand the kind of problems and coding challenges you'll face.
            </p>
            <a
              href="https://docs.google.com/document/d/1OROKDAf0lzKPN0jPLqQBbtfYQT4WoBi0/edit?usp=sharing&ouid=113281512485015431729&rtpof=true&sd=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#F53D8A] text-white px-5 py-3 text-base font-black border-2 border-slate-900 font-display tracking-widest uppercase cursor-pointer hover:brightness-110 transition-all"
            >
              View PYQ →
            </a>
            <p className="mt-5 text-sm font-bold text-slate-700">💡 Tip: Practice these questions multiple times to build confidence.</p>
            <p className="mt-4 text-[11px] font-bold text-slate-900 uppercase tracking-wide">🎯 Disclaimer: The Syllabus for Codex Start changes each year.</p>
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

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="bg-[#C4DFED] border-4 border-slate-900 p-3 font-mono text-xs font-black uppercase tracking-[0.22em] text-slate-900">
              Technical: 3 rounds
            </div>
            <div className="bg-[#FCB6D1] border-4 border-slate-900 p-3 font-mono text-xs font-black uppercase tracking-[0.22em] text-slate-900">
              Non-Technical: 2 rounds
            </div>
          </div>

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
            <div className="hidden md:block absolute left-[calc(2.5rem_-_2px)] top-0 bottom-0 w-1 bg-slate-900" />

            <StaggerContainer className="space-y-8" key={activeTrack}>
              {(activeTrack === 'tech' ? TECH_TIMELINE : NON_TECH_TIMELINE).map((phase, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-6 md:gap-10 items-start">
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

      {/* â”€â”€ RULES & REGULATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-24 bg-background-light border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="mb-8 flex items-center gap-4">
              <div className="inline-block bg-[#C4DFED] text-slate-900 px-4 py-1 font-bold text-sm uppercase tracking-widest font-mono border-2 border-slate-900">
                Rules and Regulations
              </div>
            </div>
            <h2 className="text-5xl font-black uppercase text-slate-900 font-display leading-none mb-12">
              Club Code of <span className="text-primary">Conduct</span>
            </h2>
          </ScrollReveal>

          <div className="bg-white border-4 border-slate-900 brutalist-shadow p-8 md:p-10">
            <ol className="space-y-4 list-decimal list-outside pl-6 text-slate-700 text-base md:text-lg font-medium leading-relaxed">
              {RULES.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* â”€â”€ OPEN RECRUITMENT TRACKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="domains" className="py-12 bg-white border-b-4 border-slate-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 relative z-10">
          <ScrollReveal>
            <div className="mb-6">
              <div className="inline-block bg-[#FCB6D1] text-slate-900 px-3 py-1 font-bold mb-3 text-xs uppercase tracking-widest font-mono border-2 border-slate-900">
                Join the Team
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-900 font-display leading-none mb-2">
                Who are we <span className="text-primary">looking for?</span>
              </h2>
              <p className="max-w-3xl text-sm text-slate-700 leading-relaxed">
                We are looking for people who love to build, create, and learn fast. Technical roles need coding drive; creative and operational roles need creativity, initiative, and leadership.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mt-4">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="relative lg:pt-12">
                <div className="hidden lg:block absolute left-1/2 top-12 h-7 w-1 -translate-x-1/2 bg-slate-900" />
                <div className="h-full rounded-none border-4 border-slate-900 bg-[#C4DFED] p-3 brutalist-shadow transition-all duration-200 hover:-translate-y-1" style={{ transform: "rotate(-0.8deg)" }}>
                  <div className="mb-2 inline-block border-2 border-slate-900 bg-slate-900 px-2 py-1.5 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white">
                    [ CATEGORY: TECHNICAL ]
                  </div>
                  <div className="mb-3 inline-block border-2 border-slate-900 bg-white px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.22em] text-slate-900">
                    STATUS: HIRING
                  </div>

                  <div className="space-y-2.5">
                    {TECH_TRACK.map((role, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-none border-3 border-slate-900 bg-white p-2.5 transition-all duration-200 hover:-translate-y-1 hover:translate-x-1"
                        style={{ boxShadow: idx % 2 === 0 ? "5px 5px 0px #03045E" : "7px 7px 0px #03045E", transform: idx % 2 === 0 ? "translateX(-3px)" : "translateX(3px)" }}
                      >
                        <div className="absolute -right-2 -top-2 h-3.5 w-3.5 border-3 border-slate-900 bg-[#F53D8A]" />
                        <div className="mb-1.5 inline-block border border-slate-900 bg-slate-900 px-2 py-1 font-mono text-[7px] font-black uppercase tracking-[0.2em] text-white">
                          STATUS: HIRING
                        </div>
                        <h4 className="text-lg font-black uppercase font-display text-slate-900 leading-tight">{role.title}</h4>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">{role.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative lg:pt-12">
                <div className="hidden lg:block absolute left-1/2 top-12 h-7 w-1 -translate-x-1/2 bg-slate-900" />
                <div className="h-full rounded-none border-4 border-slate-900 bg-[#FCB6D1] p-3 brutalist-shadow transition-all duration-200 hover:-translate-y-1" style={{ transform: "rotate(0.8deg)" }}>
                  <div className="mb-2 inline-block border-2 border-slate-900 bg-slate-900 px-2 py-1.5 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white">
                    [ CATEGORY: NON TECHNICAL ]
                  </div>
                  <div className="mb-3 inline-block border-2 border-slate-900 bg-white px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.22em] text-slate-900">
                    STATUS: HIRING
                  </div>

                  <div className="space-y-2.5">
                    {NON_TECH_TRACK.map((role, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-none border-3 border-slate-900 bg-white p-2.5 transition-all duration-200 hover:-translate-y-1 hover:translate-x-1"
                        style={{ boxShadow: idx % 2 === 0 ? "5px 5px 0px #03045E" : "7px 7px 0px #03045E", transform: idx % 2 === 0 ? "translateX(-2px)" : "translateX(2px)" }}
                      >
                        <div className="absolute -right-2 -top-2 h-3.5 w-3.5 border-3 border-slate-900 bg-[#C4DFED]" />
                        <div className="mb-1.5 inline-block border border-slate-900 bg-slate-900 px-2 py-1 font-mono text-[7px] font-black uppercase tracking-[0.2em] text-white">
                          STATUS: HIRING
                        </div>
                        <h4 className="text-lg font-black uppercase font-display text-slate-900 leading-tight">{role.title}</h4>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-800">{role.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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

          <ScrollReveal>
            <div className="mb-8">
              <div className="inline-block bg-white text-slate-900 px-4 py-1 font-bold text-sm uppercase tracking-widest font-mono border-2 border-slate-900">
                Frequently Asked Questions
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
              Applications Open — Intake 2026
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-8 uppercase leading-none italic font-display">
              Be A Part Of Us.
            </h2>
            <p className="text-2xl font-bold text-white/90 mb-12 max-w-2xl mx-auto">
              Register for the orientation session and become part of a community built on curiosity, creativity, and technical ambition.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <SonarButton
                href="https://forms.gle/exrCRqSNMF9gfWuF9"
                className="bg-white text-slate-900 px-12 py-6 text-xl md:text-2xl font-black border-4 border-slate-900 w-full md:w-auto font-display tracking-widest uppercase cursor-pointer inline-block text-center"
              >
                REGISTER NOW
              </SonarButton>
              <motion.a
                href="https://chat.whatsapp.com/LLXDu92vhNxFds0UghofLi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-slate-900 text-white px-12 py-6 text-xl md:text-2xl font-black border-4 border-slate-900 w-full md:w-auto font-display tracking-widest uppercase cursor-pointer text-center"
              >
                JOIN OUR COMMUNITY
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


