import React from 'react';
import styles from './page.module.css';

export function getGuideContent(slug: string) {
  switch (slug) {
    case 'compression-shirt-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>What is a compression shirt?</strong> A compression shirt is a specialized athletic garment made from highly elastic fabrics (like spandex and hydrophobic polyester) designed to fit tightly against the skin. It supports muscles, reduces fatigue, improves blood circulation, and wicks sweat away from the body during intense physical activity.
          </div>
          
          <h2>How Compression Wear Works</h2>
          <p>
            Compression garments apply graduated surface pressure to specific body parts. This gentle squeezing helps stabilize muscles and reduce the micro-vibrations that occur during high-impact activities like running or heavy weightlifting. 
          </p>
          <p>
            By stabilizing the muscle, compression wear minimizes energy waste and delays the onset of fatigue. Furthermore, the pressure promotes venous return—helping blood flow back to the heart more efficiently—which accelerates the delivery of oxygen to working muscles.
          </p>

          <h2>Key Benefits</h2>
          <ul>
            <li><strong>Reduced Muscle Fatigue:</strong> Less vibration means less tissue damage and delayed soreness.</li>
            <li><strong>Improved Proprioception:</strong> The tight fit provides constant feedback to your brain about your body&apos;s position in space.</li>
            <li><strong>Temperature Regulation:</strong> Premium compression shirts wick moisture rapidly, keeping you cool in the heat and insulating you in the cold.</li>
            <li><strong>Chafe Prevention:</strong> Since the fabric acts as a second skin, it eliminates the friction between clothing and your body.</li>
          </ul>
        </div>
      );
    case 'compression-vs-regular-gym-wear':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>Compression vs Regular Gym Wear:</strong> Compression wear fits skin-tight to support muscles, improve circulation, and maximize sweat evaporation. Regular gym wear (like cotton or loose polyester) fits loosely, offering unrestricted casual comfort but lacking muscle support and rapid moisture management.
          </div>
          
          <h2>Detailed Comparison</h2>
          <p>
            When choosing between compression wear and standard gym apparel, the decision primarily comes down to your training intensity and goals.
          </p>
          
          <h3>Material and Fit</h3>
          <p>
            <strong>Compression:</strong> Engineered with high percentages of elastane (spandex) mixed with advanced synthetic fibers. It conforms precisely to your body shape.
            <br />
            <strong>Regular:</strong> Often made from cotton blends or basic polyester. It drapes over the body and relies on air flow between the skin and fabric for cooling.
          </p>

          <h3>Performance Impact</h3>
          <p>
            During high-intensity interval training (HIIT), sprinting, or heavy lifting, compression wear keeps muscles warm and supported. Regular clothing is better suited for low-intensity workouts, stretching, or casual wear to and from the gym.
          </p>
        </div>
      );
    case 'how-to-choose-gym-clothing':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>How to choose gym clothing:</strong> Select gym clothing based on three factors: <strong>Activity Type</strong> (tight/compression for high-intensity or running, loose for yoga/casual lifting), <strong>Fabric</strong> (moisture-wicking synthetics over cotton), and <strong>Environment</strong> (breathable for heat, layered/insulated for cold).
          </div>
          
          <h2>Step-by-Step Selection Guide</h2>
          <p>Finding the perfect workout gear requires balancing comfort, performance, and durability.</p>
          
          <h3>1. Prioritize Fabric Over Fashion</h3>
          <p>Avoid 100% cotton for intense workouts; it absorbs sweat and becomes heavy, leading to chafing. Look for blends containing polyester, nylon, and elastane. These materials pull moisture away from the skin to the fabric&apos;s surface where it can evaporate.</p>

          <h3>2. Match the Fit to the Function</h3>
          <ul>
            <li><strong>Running/Cycling:</strong> Form-fitting apparel reduces aerodynamic drag and prevents chafing.</li>
            <li><strong>Weightlifting:</strong> Articulated fits that allow for a full range of motion without riding up.</li>
            <li><strong>Yoga/Mobility:</strong> Four-way stretch fabrics that move seamlessly with your body.</li>
          </ul>
        </div>
      );
    case 'moisture-wicking-fabric-explained':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>What is moisture-wicking fabric?</strong> Moisture-wicking fabric is a synthetic material (usually polyester or nylon) engineered with capillary action. It draws sweat away from the skin to the exterior of the clothing, where it can evaporate quickly, keeping the athlete dry and regulating body temperature.
          </div>
          
          <h2>The Science of Capillary Action</h2>
          <p>
            Unlike natural fibers like cotton that absorb water into the core of the fiber, synthetic wicking fibers are hydrophobic (water-repelling). The fibers are woven in a way that creates microscopic channels. 
          </p>
          <p>
            When you sweat, these channels act like tiny straws, pulling moisture through the fabric via capillary action. Once the moisture reaches the outer surface of the garment, it spreads out over a wider surface area, which dramatically speeds up the evaporation process.
          </p>
          
          <h2>Why It Matters in Hot Climates</h2>
          <p>
            In high-humidity environments like India, sweat doesn&apos;t evaporate easily off bare skin. Moisture-wicking apparel facilitates this process, preventing the dangerous buildup of core body heat and eliminating the discomfort of a heavy, drenched shirt.
          </p>
        </div>
      );
    case 'best-clothing-for-running':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>The best clothing for running</strong> includes lightweight, moisture-wicking tops, anti-chafe compression shorts or running tights, and supportive, cushioned socks. Avoid cotton entirely, and prioritize garments with flatlock seams and reflective elements for safety.
          </div>
          
          <h2>Essential Running Gear</h2>
          <p>Running is a high-repetition, high-impact sport. The wrong clothing can lead to severe chafing, overheating, or hypothermia depending on the weather.</p>
          
          <h3>The Upper Body</h3>
          <p>A highly breathable, aerodynamic top is crucial. Look for mesh paneling in high-heat zones (underarms, upper back). A snug fit prevents the fabric from flapping in the wind and causing irritation.</p>
          
          <h3>The Lower Body</h3>
          <p>Many runners prefer a two-in-one short system: an inner compression liner to prevent thigh chafing and support the glutes/hamstrings, with a lightweight outer shell for modesty and pockets.</p>
        </div>
      );
    case 'workout-clothing-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>The ultimate workout clothing guide:</strong> Build your athletic wardrobe with three core layers: a moisture-wicking base layer (compression or fitted tee), a supportive bottom (training shorts or tights), and a versatile outer layer (track jacket or hoodie) for warm-ups and cool-downs.
          </div>
          
          <h2>Building Your Training Wardrobe</h2>
          <p>An effective workout wardrobe is versatile, durable, and purpose-built.</p>
          
          <h3>Base Layers</h3>
          <p>Your base layer sits directly against the skin. Its primary job is moisture management. Invest heavily in premium base layers, as they dictate your overall comfort during a workout.</p>
          
          <h3>Training Bottoms</h3>
          <p>Whether you choose shorts, joggers, or tights, ensure they have a secure waistband (drawstrings are ideal) and sufficient stretch to allow for deep squats and lunges.</p>
        </div>
      );
    case 'recovery-clothing-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>What is recovery clothing?</strong> Recovery clothing consists of graduated compression garments worn after a workout. They apply targeted pressure to limbs to increase venous blood flow, flush out metabolic waste (like lactic acid), and reduce delayed onset muscle soreness (DOMS).
          </div>
          
          <h2>How Recovery Apparel Accelerates Healing</h2>
          <p>After an intense workout, muscles are micro-torn and filled with metabolic byproducts. The faster blood circulates through these areas, the faster nutrients are delivered and waste is removed.</p>
          
          <h3>Graduated Compression</h3>
          <p>True recovery garments use graduated compression—meaning the pressure is tightest at the extremities (like the ankles) and gradually decreases towards the heart. This acts as a secondary pump, assisting the cardiovascular system in returning blood from the limbs.</p>
        </div>
      );
    case 'athletic-apparel-materials':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>Best athletic apparel materials:</strong> The highest-performing athletic materials are <strong>Polyester</strong> (durable, hydrophobic, quick-drying), <strong>Nylon</strong> (exceptionally soft, strong, stretchy), and <strong>Elastane/Spandex</strong> (provides 4-way stretch and shape retention).
          </div>
          
          <h2>Understanding Fabric Blends</h2>
          <p>Premium activewear is rarely made from a single material. It utilizes precise blends to achieve optimal performance.</p>
          
          <h3>Polyester: The Workhorse</h3>
          <p>Polyester is the foundation of modern activewear. It is lightweight, resists shrinking and wrinkling, and boasts excellent moisture-wicking properties. Advanced polyester weaves can even mimic the soft feel of cotton.</p>
          
          <h3>Nylon: The Premium Touch</h3>
          <p>Nylon is smoother and stronger than polyester. It is often used in high-end leggings, compression gear, and seamless apparel because of its luxurious hand-feel and incredible durability.</p>
          
          <h3>Elastane (Spandex / Lycra): The Stretch</h3>
          <p>Never used alone, elastane is blended (usually between 5% to 20%) into other fabrics to give garments stretch and recovery. It ensures your clothes snap back to their original shape after being stretched over your knees or elbows.</p>
        </div>
      );
    case 'size-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>DualDeer Size Guide:</strong> Our performance apparel features an athletic, tailored fit. For compression gear, order your true size for a skin-tight, supportive fit. For a more relaxed, casual fit in our standard gym wear, we recommend sizing up one full size.
          </div>
          
          <h2>How to Measure</h2>
          <p>Use a flexible measuring tape and measure directly against your skin or over tight-fitting underwear.</p>
          
          <ul>
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
            <li><strong>Waist:</strong> Measure around the narrowest part of your waist, where your body bends side to side.</li>
            <li><strong>Hips:</strong> Measure around the fullest part of your hips and glutes.</li>
          </ul>
          
          <h2>Fit Types Explained</h2>
          <p><strong>Compression Fit:</strong> Ultra-tight, second-skin feel. May feel restrictive at first but stretches to conform to your body.</p>
          <p><strong>Athletic Fit:</strong> Skims the body closely but leaves a small amount of room. Accentuates the physique without being skin-tight.</p>
        </div>
      );
    case 'care-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>How to care for activewear:</strong> Machine wash cold with similar colors. Turn garments inside out. <strong>Never</strong> use fabric softener or bleach, as they destroy moisture-wicking properties and elastane. Air dry or tumble dry on the lowest heat setting.
          </div>
          
          <h2>Protecting Your Investment</h2>
          <p>Premium activewear requires specific care to maintain its elasticity, color, and technical properties.</p>
          
          <h3>The Danger of Fabric Softeners</h3>
          <p>Fabric softeners work by coating fibers in a waxy residue to make them feel soft. On synthetic activewear, this wax clogs the microscopic moisture-wicking channels, completely ruining the garment&apos;s ability to handle sweat. It also traps odors.</p>
          
          <h3>Washing Best Practices</h3>
          <ul>
            <li>Wash activewear separately from heavy items like jeans or towels with zippers that can cause snags.</li>
            <li>Use a sports-specific detergent designed to break down body oils and sweat trapped in synthetic fibers.</li>
            <li>Avoid high heat at all costs. Hot water and hot dryers will melt the elastane fibers, causing your gear to permanently lose its stretch and shape.</li>
          </ul>
        </div>
      );
    case 'sweat-management-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>How to manage heavy sweating at the gym:</strong> Wear 100% moisture-wicking synthetic blends (polyester/nylon), avoid cotton entirely, utilize micro-ventilation panels in high-heat zones, and consider a highly breathable base layer to accelerate evaporation.
          </div>
          
          <h2>The Mechanics of Sweat Management</h2>
          <p>Sweating is the body&apos;s natural cooling mechanism. The goal of activewear is not to stop you from sweating, but to manage that moisture so it doesn&apos;t hinder your performance.</p>
          
          <h3>Why Cotton Fails</h3>
          <p>Cotton absorbs up to 27 times its weight in water. During heavy exertion, a cotton shirt becomes a heavy, wet blanket that traps heat against your skin and causes severe chafing.</p>

          <h3>Advanced Wicking</h3>
          <p>DualDeer fabrics utilize a push-pull moisture management system. The inner layer pulls sweat off the skin, while the outer layer pushes it across a wide surface area for rapid evaporation.</p>
        </div>
      );
    case 'gym-clothing-buying-guide':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>Gym clothing buying guide checklist:</strong> 1) Prioritize fit for your specific sport. 2) Insist on 4-way stretch elastane blends. 3) Check for flatlock seams to prevent chafing. 4) Ensure the fabric is hydrophobic (moisture-wicking). 5) Look for shape-retention memory.
          </div>
          
          <h2>Building the Perfect Wardrobe</h2>
          <p>Investing in high-quality activewear pays dividends in comfort, performance, and longevity.</p>
          
          <h3>Essential Pieces</h3>
          <ul>
            <li><strong>Compression Base Layers:</strong> Crucial for muscle support and thermoregulation.</li>
            <li><strong>Performance Shorts:</strong> Look for built-in liners and secure pockets.</li>
            <li><strong>Breathable Tees:</strong> Ideal for versatile training across multiple disciplines.</li>
          </ul>
        </div>
      );
    case 'heat-management-activewear':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>Heat management in activewear:</strong> Specialized cooling apparel uses highly conductive fibers, strategic micro-mesh ventilation in sweat zones, and rapid moisture evaporation to actively pull thermal energy away from the body during exercise.
          </div>
          
          <h2>Staying Cool Under Pressure</h2>
          <p>In hot climates, heat dissipation is the limiting factor in athletic performance. If your core temperature rises too high, your power output drops significantly.</p>
          
          <h3>Strategic Ventilation</h3>
          <p>We map the human body&apos;s heat zones—typically the upper back, underarms, and lower spine—and integrate laser-cut micro-perforations or mesh panels specifically in these areas to maximize airflow.</p>
        </div>
      );
    case 'athletic-clothing-science':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>The science of athletic clothing:</strong> Modern activewear relies on biomechanical engineering, utilizing kinetic stretch mapping to support muscles without restricting movement, and thermodynamic fabric structures to continuously regulate body temperature.
          </div>
          
          <h2>Biomechanical Engineering</h2>
          <p>Clothing is your first layer of equipment. It must interact seamlessly with your body&apos;s biomechanics. This involves placing seams away from high-friction areas (like the inner thigh or underarm) and using elastane to mimic the elasticity of human skin.</p>
          
          <h3>Thermodynamics</h3>
          <p>Advanced fabrics manipulate heat transfer. They can trap dead air to insulate you in the cold (convection), or rapidly spread moisture to cool you down (evaporation).</p>
        </div>
      );
    case 'how-to-layer-gym-clothes':
      return (
        <div className={styles.content}>
          <div className={styles.directAnswer}>
            <strong>How to layer gym clothes:</strong> Use the 3-layer system: 1) A tight, moisture-wicking base layer to manage sweat. 2) A thermal mid-layer to trap heat (if cold). 3) A protective outer layer (wind/water resistant) that can be easily removed once your core temperature rises.
          </div>
          
          <h2>The Art of Layering</h2>
          <p>Layering is essential for outdoor training or transitioning between a cold environment and a heated gym.</p>
          
          <h3>The Base Layer</h3>
          <p>Never compromise on the base layer. It must be moisture-wicking. If you wear cotton as a base, it will soak with sweat and make you freeze once you stop moving.</p>
          
          <h3>The Outer Shell</h3>
          <p>A good outer layer should block wind but remain breathable, allowing the moisture vapor pushed out by your base layer to escape into the atmosphere.</p>
        </div>
      );
    default:
      return (
        <div className={styles.content}>
          <p>Guide not found.</p>
        </div>
      );
  }
}
