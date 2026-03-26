"use client";
import { motion } from "framer-motion";
import { MoveRight, Activity, Dumbbell, Timer, Flame, Crosshair } from "lucide-react";
import styles from "./CategoryIcons.module.css";

const icons = [
  { name: "Yoga", icon: <Activity size={32} strokeWidth={1.5} /> },
  { name: "Fitness", icon: <Dumbbell size={32} strokeWidth={1.5} /> },
  { name: "Gym", icon: <Flame size={32} strokeWidth={1.5} /> },
  { name: "Equipment", icon: <Crosshair size={32} strokeWidth={1.5} /> },
  { name: "Running", icon: <Timer size={32} strokeWidth={1.5} /> },
];

export default function CategoryIcons() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {icons.map((item, index) => (
          <motion.div
            key={item.name}
            className={`${styles.iconItem} ${index === 0 ? styles.active : ""}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className={`${styles.iconCircle} ${index === 0 ? styles.activeCircle : ""}`}>
              <span className={styles.svgIcon}>{item.icon}</span>
            </div>
            <span className={styles.name}>{item.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
