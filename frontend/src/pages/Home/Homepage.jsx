import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import logo from "/tamasha-logo.png";
// ✅ Best practice - always works
import "./Homepage.css";

// ── Intersection Observer Hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated Letter Title ───────────────────────────────────────────────────
function AnimatedTitle({ text, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s`,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// ── Scroll-triggered Fade Up ────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Scroll-triggered Slide In ───────────────────────────────────────────────
function SlideIn({ children, delay = 0, from = "left" }) {
  const [ref, inView] = useInView();
  const dir = from === "left" ? "-60px" : "60px";
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : `translateX(${dir})`,
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated Counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}


// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = ["How It Works", "Roles"];

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--transparent"}`}>
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src={logo} className="navbar__logo-img" alt="Tamasha Logo" />
          <div className="navbar__logo-text-group">
            <span className="navbar__logo-name">TAMASHA</span>
            <span className="navbar__logo-slogan">INNOVATE • CONNECT • GROW</span>
          </div>
        </Link>
        {/* Desktop Links */}
        <div className="navbar__links">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="navbar__link"
            >
              {link}
            </a>
          ))}
          <Link to="/signup" className="navbar__cta">
            GET STARTED
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="navbar__hamburger"
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMenuOpen(false)}
              className="navbar__mobile-link"
            >
              {link}
            </a>
          ))}
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="navbar__mobile-link"
          >
            Register
          </Link>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="navbar__mobile-link"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSubtitleVisible(true), 900);
    const t2 = setTimeout(() => setBtnVisible(true), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="hero__grid-bg" />
      <div className="hero__glow" />

      {/* Eyebrow Slogan */}
      <div className={`hero__eyebrow ${subtitleVisible ? "hero__eyebrow--visible" : "hero__eyebrow--hidden"}`}>
        <span className="hero__eyebrow-line" />
        <span className="hero__eyebrow-text">INNOVATE • CONNECT • GROW</span>
        <span className="hero__eyebrow-line" />
      </div>

      {/* Animated Title */}
      <div className="hero__title-wrap">
        <h1 className="hero__title-line">
          <AnimatedTitle text="TAMASHA" delay={100} />
        </h1>
      </div>

      {/* Subtitle */}
      <p className={`hero__subtitle ${subtitleVisible ? "hero__subtitle--visible" : "hero__subtitle--hidden"}`}>
        The modern university event platform for students and organizers to discover, innovate, and connect seamlessly.
      </p>

      {/* CTA Buttons */}
      <div className={`hero__buttons ${btnVisible ? "hero__buttons--visible" : "hero__buttons--hidden"}`}>
        <a href="#how-it-works" className="btn-secondary">HOW IT WORKS</a>
      </div>

      {/* Scroll Indicator */}
      <div className={`hero__scroll-indicator ${btnVisible ? "hero__scroll-indicator--visible" : "hero__scroll-indicator--hidden"}`}>
        <span className="hero__scroll-label">SCROLL</span>
        <div className="hero__scroll-track">
          <div className="hero__scroll-dot" />
        </div>
      </div>
    </section>
  );
}

// ── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 500,   suffix: "+", label: "Events Hosted" },
    { value: 12000, suffix: "+", label: "Students Registered" },
    { value: 50,    suffix: "+", label: "Universities" },
    { value: 98,    suffix: "%", label: "Satisfaction Rate" },
  ];

  return (
    <section className="stats-bar">
      <div className="stats-bar__grid">
        {stats.map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.1}>
            <div className="stats-bar__item">
              <div className="stats-bar__number">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="stats-bar__label">{s.label.toUpperCase()}</div>
              <div className="stats-bar__rule" />
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create an Account",
      desc: "Sign up as a Student and Organizer. Role-based access ensures you see exactly what matters most to you.",
    },
    {
      num: "02",
      title: "Discover Events",
      desc: "Browse all university events filtered by type, category, or department. Find what excites you.",
    },
    {
      num: "03",
      title: "Register & Participate",
      desc: "One-click registration. Get notified, attend, and make the most of your university life.",
    },
    {
      num: "04",
      title: "Share Feedback",
      desc: "Rate and review events after attending. Help organizers continuously improve future experiences.",
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__inner">
        <FadeUp>
          <div className="how-it-works__header">
            <p className="section-eyebrow">PROCESS</p>
            <h2 className="section-heading">How It Works</h2>
          </div>
        </FadeUp>

        <div className="how-it-works__grid">
          {steps.map((step, i) => (
            <SlideIn key={step.num} delay={i * 0.1} from="left">
              <div className="step-card">
                <div className="step-card__number">{step.num}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
                <div className="step-card__hover-line" />
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Roles Section ───────────────────────────────────────────────────────────
function RolesSection() {
  const roles = [
    {
      title: "Student",
      icon: "◆",
      features: [
        "Browse & discover events",
        "Register for events",
        "Cancel registrations",
        "Submit feedback & ratings",
      ],
      featured: false,
    },
    {
      title: "Organizer",
      icon: "▲",
      features: [
        "Create new events",
        "Update event details",
        "Delete events",
        "Manage registrations",
      ],
      featured: true,
    },
  ];

  return (
    <section id="roles" className="roles">
      <div className="roles__inner">
        <FadeUp>
          <div className="roles__header">
            <p className="section-eyebrow">WHO'S INVOLVED</p>
            <h2 className="section-heading">Built for Every Role</h2>
          </div>
        </FadeUp>

        <div className="roles__grid">
          {roles.map((role, i) => (
            <FadeUp key={role.title} delay={i * 0.15}>
              <div className={`role-card ${role.featured ? "role-card--featured" : "role-card--default"}`}>
                {role.featured && (
                  <div className="role-card__badge">
                    <span>MOST USED</span>
                  </div>
                )}
                <div className={`role-card__icon ${role.featured ? "role-card__icon--featured" : "role-card__icon--default"}`}>
                  {role.icon}
                </div>
                <h3 className={`role-card__title ${role.featured ? "role-card__title--featured" : "role-card__title--default"}`}>
                  {role.title}
                </h3>
                <ul className="role-card__features">
                  {role.features.map((feat, j) => (
                    <li
                      key={j}
                      className={`role-card__feature ${role.featured ? "role-card__feature--featured" : "role-card__feature--default"}`}
                    >
                      <span className={`role-card__feature-arrow ${role.featured ? "role-card__feature-arrow--featured" : "role-card__feature-arrow--default"}`}>
                        ▸
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Strip ──────────────────────────────────────────────────────────
function FeaturesStrip() {
  const features = [
    {
      icon: "⚡",
      title: "Fast & Responsive",
      desc: "Under 3-second load time. Works flawlessly on any device and any screen size.",
    },
    {
      icon: "🔒",
      title: "Secure by Default",
      desc: "JWT authentication, encrypted passwords, and role-based access control built in.",
    },
    {
      icon: "💬",
      title: "Feedback System",
      desc: "Custom feedback forms per event. Ratings, reviews, and suggestions built in.",
    },
  ];

  return (
    <section className="features-strip">
      <div className="features-strip__inner">
        <FadeUp>
          <p className="features-strip__eyebrow">PLATFORM FEATURES</p>
        </FadeUp>
        <div className="features-strip__grid">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <div className="feature-item">
                <div className="feature-item__icon">{f.icon}</div>
                <h4 className="feature-item__title">{f.title}</h4>
                <p className="feature-item__desc">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ──────────────────────────────────────────────────────────────
function CTABanner() {
  const [ref, inView] = useInView(0.2);

  return (
    <section id="register" className="cta-banner">
      <div className="cta-banner__texture" />
      <div
        ref={ref}
        className={`cta-banner__inner ${inView ? "cta-banner__inner--visible" : "cta-banner__inner--hidden"}`}
      >
        <p className="cta-banner__eyebrow">JOIN TODAY</p>
        <h2 className="cta-banner__heading">
          Your Campus.<br />Your Events.
        </h2>
        <p className="cta-banner__sub">
          Join thousands of students using TAMASHA to stay connected, innovate, and shape university culture.
        </p>
        <div className="cta-banner__buttons">
          <Link to="/signup" className="btn-dark">CREATE ACCOUNT →</Link>
          <Link to="/login" className="btn-outline-dark">SIGN IN</Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const date = new Date();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">

          {/* Brand */}
          <div>
            <div className="footer__brand-logo">
            <img src="/tamasha-logo.png" className="footer__logo-img" alt="Tamasha Logo" />

              <div className="navbar__logo-text-group">
                <span className="footer__logo-name">TAMASHA</span>
                <span className="footer__logo-slogan">INNOVATE • CONNECT • GROW</span>
              </div>
            </div>
            <p className="footer__brand-desc">
              The premier event management platform to innovate, connect, and grow campus communities.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h5 className="footer__col-heading">PLATFORM</h5>
            <ul className="footer__link-list">
              <li><Link to="/signup" className="footer__link">Register</Link></li>
              <li><Link to="/login" className="footer__link">Login</Link></li>
            </ul>
          </div>

          {/* Roles Info Links */}
          <div>
            <h5 className="footer__col-heading">ROLES</h5>
            <ul className="footer__link-list">
              <li><a href="#roles" className="footer__link">Student</a></li>
              <li><a href="#roles" className="footer__link">Organizer</a></li>
            </ul>
          </div>

        </div>

        <div className="footer__bottom">
          <p>©{date.getFullYear()} TAMASHA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ── App Root ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <RolesSection />
      <FeaturesStrip />
      <CTABanner />
      <Footer />
    </>
  );
}