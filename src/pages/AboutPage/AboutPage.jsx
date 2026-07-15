import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bot, ChartNoAxesCombined, MessageSquareText, ShieldCheck } from "lucide-react";
import { Badge, Button } from "../../components/Ui";
import "./AboutPage.css";

const story = [
  {
    eyebrow: "THE SHIFT",
    title: "Hiring is changing",
    text: "More companies now use AI-led interviews early in their recruitment process. The format is unfamiliar, even when you know your craft.",
    icon: Bot,
  },
  {
    eyebrow: "THE GAP",
    title: "Skill needs a safe room",
    text: "Knowing an answer and delivering it clearly under timed, camera-on pressure are two different skills.",
    icon: MessageSquareText,
  },
  {
    eyebrow: "THE SANDBOX",
    title: "Practice the real environment",
    text: "Answerly gives you a calm place to rehearse AI-style questions, structure your thinking, and build confidence before it counts.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "THE OUTCOME",
    title: "Turn practice into progress",
    text: "Review every attempt, see your patterns, and walk into your next interview ready to communicate your best work.",
    icon: ChartNoAxesCombined,
  },
];

function AboutPage({ playerName, isSignedIn, onStartPractice }) {
  const reduceMotion = useReducedMotion();
  const heroContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };
  const heroItem = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section className="page about-page">
      <motion.div className="about-hero" variants={heroContainer} initial="hidden" animate="visible">
        <motion.div variants={heroItem}><Badge tone="success">Why this project matters</Badge></motion.div>
        {isSignedIn ? <motion.p className="about-kicker" variants={heroItem}>Welcome, {playerName || "candidate"}.</motion.p> : null}
        <motion.h1 variants={heroItem}>From unfamiliar AI interviews to <span>confident conversations.</span></motion.h1>
        <motion.p className="about-intro" variants={heroItem}>
          Answerly was built for the moment when a screen, a timer, and an AI interviewer stand between you and the opportunity you want.
        </motion.p>
      </motion.div>

      <div className="about-story" aria-label="Why Answerly matters">
        <motion.div className="about-rail" aria-hidden="true" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }} />
        {story.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              className={`about-step ${index % 2 ? "is-right" : "is-left"}`}
              key={item.title}
              {...fadeUp(index * 0.08)}
              whileHover={reduceMotion ? {} : { y: -5 }}
            >
              <motion.div
                className="about-node"
                aria-hidden="true"
                animate={reduceMotion ? {} : { boxShadow: ["0 0 0 5px #101522, 0 0 0 6px #10b981", "0 0 0 5px #101522, 0 0 18px 7px rgba(99,102,241,.35)", "0 0 0 5px #101522, 0 0 0 6px #10b981"] }}
                transition={{ duration: 2.8, delay: index * 0.35, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div className="about-card" whileHover={reduceMotion ? {} : { borderColor: "rgba(167, 139, 250, .6)", boxShadow: "0 18px 42px rgba(0, 0, 0, .42), 0 0 28px rgba(99, 102, 241, .14)" }}>
                <div className="about-card-topline">
                  <span>{item.eyebrow}</span>
                  <Icon size={19} aria-hidden="true" />
                </div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </motion.div>
            </motion.article>
          );
        })}
      </div>

      <motion.div className="about-cta" {...fadeUp(0.1)} whileHover={reduceMotion ? {} : { scale: 1.01, y: -2 }}>
        <div>
          <span className="about-cta-label">YOUR NEXT REP STARTS HERE</span>
          <h2>Make the first interview feel familiar.</h2>
        </div>
        <Button onClick={onStartPractice}>{isSignedIn ? "Start a practice session" : "Create your free account"} <ArrowRight size={17} /></Button>
      </motion.div>
    </section>
  );
}

export default AboutPage;
