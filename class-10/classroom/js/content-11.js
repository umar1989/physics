/* ============================================================
   Chapter 11 — Electricity (NCERT, rationalised)
   ============================================================ */
"use strict";
CR.chapters.push({
  id: "electricity", num: 11, short: "Electricity", title: "Electricity", notes: "../electricity.html",
  topics: [
    /* ---------------- 11.1 ---------------- */
    {
      id: "current", num: "11.1", title: "Electric current and circuit", chip: "Current",
      lead: "Close and open the plug key, and switch between conventional current and electrons. Enter a current and a time to find the charge that flows, as in Example 11.1.",
      sim: ["current", { mode: "current", I: 0.5, t: 600 }],
      explain: [
        "A continuous and closed path of an electric current is called an electric circuit. If the circuit is broken anywhere (or the switch is turned off), the current stops flowing and the bulb does not glow.",
        "Electric current is expressed by the amount of charge flowing through a particular area in unit time: it is the rate of flow of electric charges. In circuits with metallic wires, electrons constitute the flow of charges.",
        "When electricity was first studied, electrons were not known, so current was taken to be the flow of positive charges. Conventionally, the direction of electric current is taken as opposite to the direction of the flow of electrons, which are negative charges.",
        "If a net charge Q flows across any cross-section of a conductor in time t, the current through the cross-section is I = Q/t.",
        "The SI unit of electric charge is the coulomb (C), equivalent to the charge contained in nearly 6 × 10¹⁸ electrons. An electron has a negative charge of 1.6 × 10⁻¹⁹ C.",
        "The unit of current is the ampere (A), named after André-Marie Ampère. One ampere is the flow of one coulomb of charge per second: 1 A = 1 C/1 s. Small currents are expressed in milliampere (1 mA = 10⁻³ A) or microampere (1 µA = 10⁻⁶ A).",
        "An ammeter measures electric current. It is always connected in series in the circuit through which the current is to be measured.",
        "In a circuit of a cell, an electric bulb, an ammeter and a plug key (Fig. 11.1), the current flows from the positive terminal of the cell to the negative terminal through the bulb and the ammeter."
      ],
      formulas: [["Electric current", "I = Q / t"], ["Unit of current", "1 A = 1 C / 1 s"], ["Charge of an electron", "e = 1.6 × 10⁻¹⁹ C"]],
      examples: [
        { n: "11.1", q: "A current of 0.5 A is drawn by a filament of an electric bulb for 10 minutes. Find the amount of electric charge that flows through the circuit.",
          solution: ["I = 0.5 A; t = 10 min = 600 s.", "Q = It = 0.5 A × 600 s = 300 C."], answer: "300 C of charge flows through the circuit.", setup: { mode: "current", I: 0.5, t: 600 } }
      ],
      questions: [
        { tag: "In-text", q: "What does an electric circuit mean?", a: "A continuous and closed path of an electric current is called an electric circuit, for example a cell, a key, a bulb and connecting wires joined in a loop. If the path is broken anywhere, the current stops.", setup: { mode: "current", closed: false } },
        { tag: "In-text", q: "Define the unit of current.", a: "The SI unit of current is the ampere (A). One ampere is the current when one coulomb of charge flows through a cross-section of a conductor in one second: 1 A = 1 C/1 s.", setup: { mode: "current", I: 1, t: 1 } },
        { tag: "In-text", q: "Calculate the number of electrons constituting one coulomb of charge.", a: "n = Q/e = 1 C ÷ (1.6 × 10⁻¹⁹ C) = 6.25 × 10¹⁸ electrons (NCERT: nearly 6 × 10¹⁸).", setup: { mode: "current", I: 1, t: 1 } }
      ]
    },
    /* ---------------- 11.2 ---------------- */
    {
      id: "potential", num: "11.2", title: "Electric potential and potential difference", chip: "Potential difference",
      lead: "A voltmeter is connected in parallel across the bulb. Enter a potential difference and a charge to find the work done, as in Example 11.2.",
      sim: ["current", { mode: "pd", V: 12, Q: 2 }],
      explain: [
        "Charges do not flow in a copper wire by themselves, just as water does not flow through a perfectly horizontal tube. The electrons move only if there is a difference of electric pressure, called the potential difference, along the conductor.",
        "This potential difference may be produced by a battery of one or more electric cells. The chemical action within a cell generates a potential difference across its terminals, even when no current is drawn from it.",
        "When the cell is connected to a conducting circuit element, the potential difference sets the charges in motion and produces an electric current. To maintain the current, the cell has to spend the chemical energy stored in it.",
        "The electric potential difference between two points in a circuit carrying current is the work done to move a unit charge from one point to the other: V = W/Q.",
        "The SI unit of potential difference is the volt (V), named after Alessandro Volta. One volt is the potential difference between two points when 1 joule of work is done to move a charge of 1 coulomb from one point to the other: 1 V = 1 J/1 C = 1 J C⁻¹.",
        "Potential difference is measured with a voltmeter. A voltmeter is always connected in parallel across the points between which the potential difference is to be measured."
      ],
      formulas: [["Potential difference", "V = W / Q"], ["Unit of potential difference", "1 V = 1 J C⁻¹"]],
      examples: [
        { n: "11.2", q: "How much work is done in moving a charge of 2 C across two points having a potential difference 12 V?",
          solution: ["Q = 2 C, V = 12 V.", "W = VQ = 12 V × 2 C = 24 J."], answer: "24 J of work is done.", setup: { mode: "pd", V: 12, Q: 2 } }
      ],
      questions: [
        { tag: "In-text", q: "Name a device that helps to maintain a potential difference across a conductor.", a: "A cell, or a battery (a combination of cells)." },
        { tag: "In-text", q: "What is meant by saying that the potential difference between two points is 1 V?", a: "It means that 1 joule of work is done to move a charge of 1 coulomb from one point to the other.", setup: { mode: "pd", V: 1, Q: 1 } },
        { tag: "In-text", q: "How much energy is given to each coulomb of charge passing through a 6 V battery?", a: "W = VQ = 6 V × 1 C = 6 J.", setup: { mode: "pd", V: 6, Q: 1 } },
        { tag: "Exercise 5", q: "How is a voltmeter connected in the circuit to measure the potential difference between two points?", a: "In parallel, across the two points between which the potential difference is to be measured.", setup: { mode: "pd", V: 6, Q: 1 } }
      ]
    },
    /* ---------------- 11.3 ---------------- */
    {
      id: "circuit-diagram", num: "11.3", title: "Circuit diagram", chip: "Circuit symbols",
      lead: "The symbols of NCERT Table 11.1. Switch to the quiz to let the class name each symbol.",
      sim: ["symbols", { mode: "learn" }],
      explain: [
        "An electric circuit, as in Fig. 11.1, comprises a cell (or a battery), a plug key, electrical components and connecting wires.",
        "It is often convenient to draw a schematic diagram, in which different components of the circuit are represented by symbols.",
        "Table 11.1 gives the conventionally used symbols for some of the most commonly used electrical components."
      ]
    },
    /* ---------------- 11.4 ---------------- */
    {
      id: "ohm", num: "11.4", title: "Ohm's law", chip: "Ohm's law",
      lead: "Activity 11.1: use 1 to 4 cells, record each reading and see the straight-line V–I graph. Then try Activity 11.2 and the data of Exercise 7.",
      sim: ["ohm", { mode: "act1", cells: 2, R: 4 }],
      explain: [
        "Is there a relationship between the potential difference across a conductor and the current through it? Activity 11.1 explores this.",
        "Approximately the same value of V/I is obtained in each case, so the V–I graph is a straight line that passes through the origin: V/I is a constant ratio.",
        "In 1827 the German physicist Georg Simon Ohm found the relationship between the current I in a metallic wire and the potential difference across its terminals.",
        "Ohm's law: the potential difference V across the ends of a given metallic wire in an electric circuit is directly proportional to the current flowing through it, provided its temperature remains the same. V ∝ I, or V/I = constant = R, or V = IR.",
        "R is a constant for the given metallic wire at a given temperature, called its resistance. Resistance is the property of a conductor to resist the flow of charges through it. Its SI unit is the ohm (Ω).",
        "If the potential difference across the two ends of a conductor is 1 V and the current through it is 1 A, its resistance is 1 Ω: 1 ohm = 1 volt/1 ampere.",
        "I = V/R: the current through a resistor is inversely proportional to its resistance. If the resistance is doubled, the current gets halved.",
        "A component used to regulate current without changing the voltage source is called a variable resistance. In a circuit, a device called a rheostat is often used to change the resistance.",
        "Activity 11.2: the current is different for different components. Some offer an easy path for the flow of current while others resist the flow. Electrons are not completely free to move in a conductor; they are restrained by the attraction of the atoms among which they move.",
        "A component of a given size that offers a low resistance is a good conductor. A conductor with some appreciable resistance is called a resistor. A component of identical size that offers a higher resistance is a poor conductor, and an insulator of the same size offers even higher resistance."
      ],
      formulas: [["Ohm's law", "V = IR"], ["Resistance", "R = V / I"], ["Unit of resistance", "1 Ω = 1 V / 1 A"]],
      activities: [
        { n: "11.1", title: "The relation between V and I",
          steps: ["Set up a circuit with a nichrome wire XY of length, say, 0.5 m, an ammeter, a voltmeter and four cells of 1.5 V each. (Nichrome is an alloy of nickel, chromium, manganese and iron.)", "First use only one cell. Note the current I in the ammeter and the potential difference V across the nichrome wire XY in the voltmeter. Tabulate them.", "Next connect two cells and note the readings. Repeat with three cells and then with four cells.", "Calculate the ratio V/I for each pair of readings.", "Plot a graph between V and I, and observe the nature of the graph."],
          observe: "Approximately the same value of V/I is obtained in each case, and the V–I graph is a straight line passing through the origin. So V/I is constant: this is Ohm's law.",
          setup: { mode: "act1", cells: 1, R: 4, record: true } },
        { n: "11.2", title: "Different components, different currents",
          steps: ["Take a nichrome wire, a torch bulb, a 10 W bulb, an ammeter (0–5 A range), a plug key and some connecting wires.", "Connect four dry cells of 1.5 V each in series with the ammeter, leaving a gap XY in the circuit.", "Complete the circuit by connecting the nichrome wire in the gap XY. Plug the key and note the ammeter reading. Take out the key from the plug. (Always take out the key after measuring the current.)", "Replace the nichrome wire with the torch bulb and note the ammeter reading. Repeat with the 10 W bulb.", "You may repeat this by keeping any material component in the gap, and compare the readings."],
          observe: "The ammeter readings are different for different components. Each component offers a different resistance to the flow of current.",
          setup: { mode: "act2", comp: "torch" } }
      ],
      questions: [
        { tag: "Exercise 7", q: "The values of current I flowing in a given resistor for the corresponding values of potential difference V across the resistor are: I (amperes) 0.5, 1.0, 2.0, 3.0, 4.0; V (volts) 1.6, 3.4, 6.7, 10.2, 13.2. Plot a graph between V and I and calculate the resistance of that resistor.", a: "The points lie close to a straight line through the origin. Its slope gives R ≈ 3.3–3.4 Ω (each V/I lies between 3.2 and 3.4 Ω; the best straight line gives 3.34 Ω).", setup: { mode: "ex7" } },
        { tag: "Exercise 8", q: "When a 12 V battery is connected across an unknown resistor, there is a current of 2.5 mA in the circuit. Find the value of the resistance of the resistor.", a: "R = V/I = 12 V ÷ (2.5 × 10⁻³ A) = 4800 Ω = 4.8 kΩ." }
      ]
    },
    /* ---------------- 11.5 ---------------- */
    {
      id: "resistance", num: "11.5", title: "Factors on which the resistance of a conductor depends", chip: "Resistivity",
      lead: "Activity 11.3: put wires (1) to (4) in the circuit and compare the ammeter readings. Then use any material from Table 11.2 to calculate R = ρl/A.",
      sim: ["resistivity", { mode: "act", wire: 1 }],
      explain: [
        "Activity 11.3: the ammeter reading decreases to one-half when the length of the wire is doubled. It increases when a thicker wire of the same material and the same length is used. It changes when a wire of a different material of the same length and area of cross-section is used.",
        "So the resistance of a conductor depends (i) on its length, (ii) on its area of cross-section, and (iii) on the nature of its material.",
        "Precise measurements show that the resistance of a uniform metallic conductor is directly proportional to its length (l) and inversely proportional to its area of cross-section (A): R ∝ l and R ∝ 1/A. So R = ρ l/A.",
        "ρ (rho) is a constant of proportionality called the electrical resistivity of the material of the conductor. Its SI unit is Ω m. It is a characteristic property of the material.",
        "Metals and alloys have very low resistivity, in the range 10⁻⁸ Ω m to 10⁻⁶ Ω m: they are good conductors of electricity. Insulators like rubber and glass have resistivity of the order of 10¹² to 10¹⁷ Ω m. Both resistance and resistivity vary with temperature.",
        "Table 11.2 shows that the resistivity of an alloy is generally higher than that of its constituent metals. Alloys do not oxidise (burn) readily at high temperatures, so they are commonly used in electrical heating devices like electric irons and toasters.",
        "Tungsten is used almost exclusively for the filaments of electric bulbs, whereas copper and aluminium are generally used for electrical transmission lines."
      ],
      formulas: [["Resistance of a conductor", "R = ρ l / A"], ["Area of cross-section of a wire", "A = πr² = πd²/4"], ["Unit of resistivity", "Ω m"]],
      activities: [
        { n: "11.3", title: "What does the resistance of a wire depend on?",
          steps: ["Complete an electric circuit of a cell, an ammeter, a nichrome wire of length l [marked (1)] and a plug key. Plug the key and note the current.", "Replace the wire by another nichrome wire of the same thickness but twice the length, 2l [marked (2)]. Note the ammeter reading.", "Now use a thicker nichrome wire of the same length l [marked (3)]. A thicker wire has a larger cross-sectional area. Note the current.", "Instead of nichrome, connect a copper wire [marked (4)] of the same length and the same area of cross-section as wire (1). Note the current.", "Does the current depend on the length of the conductor? On the area of cross-section of the wire?"],
          observe: "The current halves when the length is doubled, increases for the thicker wire, and is different for the copper wire of the same size. So the resistance depends on the length, the area of cross-section and the material of the conductor.",
          setup: { mode: "act", wire: 2 } }
      ],
      examples: [
        { n: "11.3", q: "(a) How much current will an electric bulb draw from a 220 V source, if the resistance of the bulb filament is 1200 Ω? (b) How much current will an electric heater coil draw from a 220 V source, if the resistance of the heater coil is 100 Ω?",
          solution: ["(a) V = 220 V, R = 1200 Ω. I = V/R = 220 V/1200 Ω = 0.18 A.", "(b) V = 220 V, R = 100 Ω. I = V/R = 220 V/100 Ω = 2.2 A.", "Note the difference between the currents drawn by an electric bulb and an electric heater from the same 220 V source."], answer: "(a) 0.18 A, (b) 2.2 A." },
        { n: "11.4", q: "The potential difference between the terminals of an electric heater is 60 V when it draws a current of 4 A from the source. What current will the heater draw if the potential difference is increased to 120 V?",
          solution: ["V = 60 V, I = 4 A. R = V/I = 60 V/4 A = 15 Ω.", "When V = 120 V: I = V/R = 120 V/15 Ω = 8 A."], answer: "The heater draws 8 A." },
        { n: "11.5", q: "Resistance of a metal wire of length 1 m is 26 Ω at 20 °C. If the diameter of the wire is 0.3 mm, what will be the resistivity of the metal at that temperature? Using Table 11.2, predict the material of the wire.",
          solution: ["R = 26 Ω, l = 1 m, d = 0.3 mm = 3 × 10⁻⁴ m.", "ρ = RA/l = R × πd²/(4l) = 26 Ω × 3.14 × (3 × 10⁻⁴ m)² ÷ (4 × 1 m)", "ρ = 1.84 × 10⁻⁶ Ω m."], answer: "1.84 × 10⁻⁶ Ω m at 20 °C. From Table 11.2, this is the resistivity of manganese.", setup: { mode: "free", mat: "mn", L: 1, d: 0.3 } },
        { n: "11.6", q: "A wire of given material having length l and area of cross-section A has a resistance of 4 Ω. What would be the resistance of another wire of the same material having length l/2 and area of cross-section 2A?",
          solution: ["First wire: R₁ = ρ l/A = 4 Ω.", "Second wire: R₂ = ρ (l/2)/(2A) = (1/4) × ρ l/A = R₁/4.", "R₂ = 4 Ω/4 = 1 Ω."], answer: "1 Ω." }
      ],
      questions: [
        { tag: "In-text", q: "On what factors does the resistance of a conductor depend?", a: "On its length, its area of cross-section and the nature of its material. It also changes with temperature.", setup: { mode: "act", wire: 1 } },
        { tag: "In-text", q: "Will current flow more easily through a thick wire or a thin wire of the same material, when connected to the same source? Why?", a: "Through the thick wire. R = ρl/A: a thick wire has a larger area of cross-section, so a smaller resistance.", setup: { mode: "act", wire: 3 } },
        { tag: "In-text", q: "Let the resistance of an electrical component remains constant while the potential difference across the two ends of the component decreases to half of its former value. What change will occur in the current through it?", a: "The current also becomes half, since I = V/R and R is constant." },
        { tag: "In-text", q: "Why are coils of electric toasters and electric irons made of an alloy rather than a pure metal?", a: "An alloy has a higher resistivity than its constituent metals, and it does not oxidise (burn) readily at high temperatures." },
        { tag: "In-text", q: "Use the data in Table 11.2 to answer the following – (a) Which among iron and mercury is a better conductor? (b) Which material is the best conductor?", a: ["(a) Iron: its resistivity (10.0 × 10⁻⁸ Ω m) is lower than that of mercury (94.0 × 10⁻⁸ Ω m).", "(b) Silver, which has the lowest resistivity (1.60 × 10⁻⁸ Ω m)."], setup: { mode: "free", mat: "fe", L: 1, d: 0.5 } },
        { tag: "Exercise 6", q: "A copper wire has diameter 0.5 mm and resistivity of 1.6 × 10⁻⁸ Ω m. What will be the length of this wire to make its resistance 10 Ω? How much does the resistance change if the diameter is doubled?", a: ["A = πd²/4 = 3.14 × (5 × 10⁻⁴ m)² ÷ 4 = 1.96 × 10⁻⁷ m².", "l = RA/ρ = (10 Ω × 1.96 × 10⁻⁷ m²) ÷ (1.6 × 10⁻⁸ Ω m) = 122.7 m.", "If the diameter is doubled, A becomes 4 times, so R becomes one-fourth: 10 Ω/4 = 2.5 Ω (it decreases by 7.5 Ω)."], setup: { mode: "free", mat: "custom", rho: 1.6, L: 122.7, d: 0.5 } }
      ]
    },
    /* ---------------- 11.6, 11.6.1 ---------------- */
    {
      id: "series", num: "11.6, 11.6.1", title: "Resistors in series", chip: "Series",
      lead: "Activities 11.4 and 11.5: move the ammeter between the resistors, and move the voltmeter across each resistor and across all of them. Show them as bulbs to see what happens when one is taken out.",
      sim: ["circuits", { mode: "series", n: 3, R: [1, 2, 3], V: 6, view: "R" }],
      explain: [
        "In electrical gadgets, resistors are often used in various combinations. There are two methods of joining resistors together: in series and in parallel.",
        "When resistors are joined end to end, they are said to be connected in series.",
        "Activity 11.4: in a series combination of resistors the current is the same in every part of the circuit. The ammeter reading is the same wherever the ammeter is placed.",
        "Activity 11.5: the potential difference V across the combination is equal to the sum of the potential differences across the individual resistors: V = V₁ + V₂ + V₃.",
        "Applying Ohm's law to each resistor: V₁ = IR₁, V₂ = IR₂, V₃ = IR₃. If Rs is the equivalent resistance, V = IRs. So IRs = IR₁ + IR₂ + IR₃.",
        "Rs = R₁ + R₂ + R₃: when several resistors are joined in series, the resistance of the combination equals the sum of their individual resistances, and is greater than any individual resistance."
      ],
      formulas: [["Resistors in series", "Rs = R₁ + R₂ + R₃"], ["In series, potential differences add", "V = V₁ + V₂ + V₃"]],
      activities: [
        { n: "11.4", title: "The current in a series circuit",
          steps: ["Join three resistors of different values in series. Connect them with a battery, an ammeter and a plug key. You may use resistors like 1 Ω, 2 Ω, 3 Ω and a battery of 6 V.", "Plug the key and note the ammeter reading.", "Change the position of the ammeter to anywhere in between the resistors. Note the ammeter reading each time. Do you find any change?"],
          observe: "The current in the ammeter is the same, independent of its position in the circuit. In a series combination, the same current flows through each resistor.",
          setup: { mode: "series", n: 3, R: [1, 2, 3], V: 6, amm: 2 } },
        { n: "11.5", title: "Potential differences in a series circuit",
          steps: ["In Activity 11.4, insert a voltmeter across the ends X and Y of the series combination. Plug the key and note the reading V.", "Measure the potential difference across the two terminals of the battery. Compare the two values.", "Take out the key and disconnect the voltmeter. Connect it across the first resistor and measure V₁. Similarly measure V₂ and V₃ across the other two resistors.", "Deduce a relationship between V, V₁, V₂ and V₃."],
          observe: "V = V₁ + V₂ + V₃: the total potential difference across a series combination equals the sum of the potential differences across the individual resistors.",
          setup: { mode: "series", n: 3, R: [1, 2, 3], V: 6, vm: 0 } }
      ],
      examples: [
        { n: "11.7", q: "An electric lamp, whose resistance is 20 Ω, and a conductor of 4 Ω resistance are connected to a 6 V battery. Calculate (a) the total resistance of the circuit, (b) the current through the circuit, and (c) the potential difference across the electric lamp and conductor.",
          solution: ["(a) Rs = 20 Ω + 4 Ω = 24 Ω.", "(b) I = V/Rs = 6 V/24 Ω = 0.25 A.", "(c) Across the lamp: V₁ = 20 Ω × 0.25 A = 5 V. Across the conductor: V₂ = 4 Ω × 0.25 A = 1 V.", "A single resistor that could replace both must have R = V/I = 6 V/0.25 A = 24 Ω: the total resistance of the series circuit."],
          answer: "24 Ω; 0.25 A; 5 V across the lamp and 1 V across the conductor.", setup: { mode: "series", n: 2, R: [20, 4], V: 6, vm: 0 } }
      ],
      questions: [
        { tag: "In-text", q: "Draw a schematic diagram of a circuit consisting of a battery of three cells of 2 V each, a 5 Ω resistor, an 8 Ω resistor, and a 12 Ω resistor, and a plug key, all connected in series.", a: "A 6 V battery (three 2 V cells), the 5 Ω, 8 Ω and 12 Ω resistors one after another, and a plug key, all in a single loop. Open it in the simulation to show it.", setup: { mode: "series", n: 3, R: [5, 8, 12], V: 6 } },
        { tag: "In-text", q: "Redraw the circuit of Question 1, putting in an ammeter to measure the current through the resistors and a voltmeter to measure the potential difference across the 12 Ω resistor. What would be the readings in the ammeter and the voltmeter?", a: ["Rs = 5 + 8 + 12 = 25 Ω, so the ammeter (in series) reads I = 6 V/25 Ω = 0.24 A.", "The voltmeter (in parallel with the 12 Ω resistor) reads V = IR = 0.24 A × 12 Ω = 2.88 V."], setup: { mode: "series", n: 3, R: [5, 8, 12], V: 6, vm: 2, amm: 0 } },
        { tag: "Exercise 9", q: "A battery of 9 V is connected in series with resistors of 0.2 Ω, 0.3 Ω, 0.4 Ω, 0.5 Ω and 12 Ω, respectively. How much current would flow through the 12 Ω resistor?", a: ["Rs = 0.2 + 0.3 + 0.4 + 0.5 + 12 = 13.4 Ω.", "I = 9 V/13.4 Ω = 0.67 A. In series the same current flows through each resistor, so 0.67 A flows through the 12 Ω resistor."], setup: { mode: "series", n: 5, R: [0.2, 0.3, 0.4, 0.5, 12], V: 9, vm: 4 } }
      ]
    },
    /* ---------------- 11.6.2 ---------------- */
    {
      id: "parallel", num: "11.6.2", title: "Resistors in parallel", chip: "Parallel",
      lead: "Activity 11.6: read the current in each branch and the total current. Use “Two groups in series” for Example 11.9, and bulbs to see why houses are wired in parallel.",
      sim: ["circuits", { mode: "parallel", n: 3, R: [5, 10, 30], V: 12, view: "R" }],
      explain: [
        "When resistors are connected together between the same two points X and Y, they are said to be connected in parallel.",
        "Activity 11.6: the total current I is equal to the sum of the separate currents through each branch: I = I₁ + I₂ + I₃. The potential difference V across each resistor is the same.",
        "By Ohm's law, I₁ = V/R₁, I₂ = V/R₂ and I₃ = V/R₃. If Rp is the equivalent resistance, I = V/Rp. So V/Rp = V/R₁ + V/R₂ + V/R₃.",
        "1/Rp = 1/R₁ + 1/R₂ + 1/R₃: the reciprocal of the equivalent resistance of a group of resistances joined in parallel is equal to the sum of the reciprocals of the individual resistances. (Rp is less than the smallest of them.)",
        "In a series circuit the current is the same throughout, so it is impracticable to connect an electric bulb and an electric heater in series: they need currents of widely different values (Example 11.3).",
        "Another major disadvantage of a series circuit: when one component fails, the circuit is broken and none of the components works. With series ‘fairy lights’, the electrician has to test each bulb to find the ‘dead’ one.",
        "A parallel circuit divides the current through the electrical gadgets, and the total resistance in it is decreased. This is helpful when each gadget has a different resistance and requires a different current to operate properly."
      ],
      formulas: [["Resistors in parallel", "1/Rp = 1/R₁ + 1/R₂ + 1/R₃"], ["In parallel, currents add", "I = I₁ + I₂ + I₃"]],
      activities: [
        { n: "11.6", title: "Currents in a parallel circuit",
          steps: ["Make a parallel combination XY of three resistors R₁, R₂ and R₃. Connect it with a battery, a plug key and an ammeter. Also connect a voltmeter in parallel with the combination.", "Plug the key and note the ammeter reading I and the voltmeter reading V. The potential difference across each resistor is also V: check it by connecting the voltmeter across each resistor.", "Take out the plug and remove the meters. Insert the ammeter in series with R₁ and note I₁. Similarly measure the currents I₂ and I₃ through R₂ and R₃.", "What is the relationship between I, I₁, I₂ and I₃?"],
          observe: "The total current equals the sum of the separate currents through the branches: I = I₁ + I₂ + I₃. Each resistor has the same potential difference V.",
          setup: { mode: "parallel", n: 3, R: [5, 10, 30], V: 12 } }
      ],
      examples: [
        { n: "11.8", q: "In the circuit of Fig. 11.10, suppose the resistors R₁, R₂ and R₃ have the values 5 Ω, 10 Ω, 30 Ω, respectively, which have been connected to a battery of 12 V. Calculate (a) the current through each resistor, (b) the total current in the circuit, and (c) the total circuit resistance.",
          solution: ["(a) I₁ = V/R₁ = 12 V/5 Ω = 2.4 A; I₂ = 12 V/10 Ω = 1.2 A; I₃ = 12 V/30 Ω = 0.4 A.", "(b) I = I₁ + I₂ + I₃ = (2.4 + 1.2 + 0.4) A = 4 A.", "(c) 1/Rp = 1/5 + 1/10 + 1/30 = 1/3, so Rp = 3 Ω."],
          answer: "2.4 A, 1.2 A and 0.4 A; 4 A in total; 3 Ω.", setup: { mode: "parallel", n: 3, R: [5, 10, 30], V: 12 } },
        { n: "11.9", q: "If in Fig. 11.12, R₁ = 10 Ω, R₂ = 40 Ω, R₃ = 30 Ω, R₄ = 20 Ω, R₅ = 60 Ω, and a 12 V battery is connected to the arrangement. Calculate (a) the total resistance in the circuit, and (b) the total current flowing in the circuit.",
          solution: ["R₁ and R₂ are in parallel: 1/R′ = 1/10 + 1/40 = 5/40, so R′ = 8 Ω.", "R₃, R₄ and R₅ are in parallel: 1/R″ = 1/30 + 1/20 + 1/60 = 6/60, so R″ = 10 Ω.", "R′ and R″ are in series: R = R′ + R″ = 8 Ω + 10 Ω = 18 Ω.", "I = V/R = 12 V/18 Ω = 0.67 A."],
          answer: "18 Ω; 0.67 A.", setup: { mode: "combo", nA: 2, nB: 3, R: [10, 40, 30, 20, 60], V: 12 } }
      ],
      questions: [
        { tag: "In-text", q: "Judge the equivalent resistance when the following are connected in parallel – (a) 1 Ω and 10⁶ Ω, (b) 1 Ω and 10³ Ω, and 10⁶ Ω.", a: ["(a) 1/Rp = 1/1 + 1/10⁶, so Rp = 10⁶/(10⁶ + 1) Ω ≈ 0.999999 Ω: just under 1 Ω.", "(b) 1/Rp = 1 + 10⁻³ + 10⁻⁶, so Rp ≈ 0.999 Ω. In both cases Rp is a little less than the smallest resistance, 1 Ω."], setup: { mode: "parallel", n: 3, R: [1, 1000, 1000000], V: 12 } },
        { tag: "In-text", q: "An electric lamp of 100 Ω, a toaster of resistance 50 Ω, and a water filter of resistance 500 Ω are connected in parallel to a 220 V source. What is the resistance of an electric iron connected to the same source that takes as much current as all three appliances, and what is the current through it?", a: ["1/Rp = 1/100 + 1/50 + 1/500 = (5 + 10 + 1)/500 = 16/500, so Rp = 31.25 Ω.", "The iron must have this resistance, 31.25 Ω. The current through it is I = V/R = 220 V/31.25 Ω = 7.04 A."], setup: { mode: "parallel", n: 3, R: [100, 50, 500], V: 220 } },
        { tag: "In-text", q: "What are the advantages of connecting electrical devices in parallel with the battery instead of connecting them in series?", a: ["Each device gets the full potential difference of the source.", "Each device draws the current it needs, and the total resistance of the circuit is less.", "If one device fails or is switched off, the others keep working; each can be switched on or off independently."], setup: { mode: "parallel", n: 3, R: [10, 20, 30], V: 12, view: "bulb" } },
        { tag: "In-text", q: "How can three resistors of resistances 2 Ω, 3 Ω, and 6 Ω be connected to give a total resistance of (a) 4 Ω, (b) 1 Ω?", a: ["(a) Connect 3 Ω and 6 Ω in parallel: 3 × 6/(3 + 6) = 2 Ω. Put this in series with 2 Ω: 2 + 2 = 4 Ω.", "(b) Connect all three in parallel: 1/Rp = 1/2 + 1/3 + 1/6 = 1, so Rp = 1 Ω."], setup: { mode: "combo", nA: 1, nB: 2, R: [2, 3, 6], V: 6 } },
        { tag: "In-text", q: "What is (a) the highest, (b) the lowest total resistance that can be secured by combinations of four coils of resistance 4 Ω, 8 Ω, 12 Ω, 24 Ω?", a: ["(a) Highest: all four in series, 4 + 8 + 12 + 24 = 48 Ω.", "(b) Lowest: all four in parallel, 1/Rp = 1/4 + 1/8 + 1/12 + 1/24 = (6 + 3 + 2 + 1)/24 = 1/2, so Rp = 2 Ω."], setup: { mode: "parallel", n: 4, R: [4, 8, 12, 24], V: 12 } },
        { tag: "Exercise 10", q: "How many 176 Ω resistors (in parallel) are required to carry 5 A on a 220 V line?", a: ["Each resistor carries I = V/R = 220 V/176 Ω = 1.25 A.", "Number needed = 5 A ÷ 1.25 A = 4. (Check: four 176 Ω resistors in parallel give 44 Ω, and 220 V/44 Ω = 5 A.)"], setup: { mode: "parallel", n: 4, R: [176, 176, 176, 176], V: 220 } },
        { tag: "Exercise 11", q: "Show how you would connect three resistors, each of resistance 6 Ω, so that the combination has a resistance of (i) 9 Ω, (ii) 4 Ω.", a: ["(i) Two in parallel (6 × 6/12 = 3 Ω), in series with the third: 3 + 6 = 9 Ω.", "(ii) Two in series (12 Ω), in parallel with the third: 12 × 6/(12 + 6) = 4 Ω."], setup: { mode: "combo", nA: 2, nB: 1, R: [6, 6, 6], V: 9 } },
        { tag: "Exercise 12", q: "Several electric bulbs designed to be used on a 220 V electric supply line, are rated 10 W. How many lamps can be connected in parallel with each other across the two wires of 220 V line if the maximum allowable current is 5 A?", a: ["Each lamp draws I = P/V = 10 W/220 V = 1/22 A.", "Number of lamps = 5 A ÷ (1/22 A) = 110."] },
        { tag: "Exercise 13", q: "A hot plate of an electric oven connected to a 220 V line has two resistance coils A and B, each of 24 Ω resistance, which may be used separately, in series, or in parallel. What are the currents in the three cases?", a: ["Separately: I = 220 V/24 Ω = 9.17 A.", "In series (48 Ω): I = 220 V/48 Ω = 4.58 A.", "In parallel (12 Ω): I = 220 V/12 Ω = 18.33 A."], setup: { mode: "parallel", n: 2, R: [24, 24], V: 220 } }
      ]
    },
    /* ---------------- 11.7, 11.7.1 ---------------- */
    {
      id: "heating", num: "11.7, 11.7.1", title: "Heating effect of electric current", chip: "Heating effect",
      lead: "Change I, R and t and watch the heat H = I²Rt. Then see how a fuse protects a circuit, and why a bulb filament is made of tungsten.",
      sim: ["heating", { mode: "joule", I: 5, R: 20, t: 30 }],
      explain: [
        "A battery or a cell is a source of electrical energy. To maintain the current, the source has to keep expending its energy. Part of it may be used for useful work (like rotating the blades of a fan); the rest may be expended as heat, raising the temperature of the gadget.",
        "If the circuit is purely resistive (only resistors connected to the battery), the source energy is dissipated entirely in the form of heat. This is the heating effect of electric current, used in devices such as electric heaters and electric irons.",
        "For a current I through a resistor with potential difference V, the work done in moving a charge Q in time t is VQ. So the power input is P = VQ/t = VI, and the energy supplied in time t is VIt.",
        "This energy is dissipated in the resistor as heat: H = VIt. Applying Ohm's law, H = I²Rt. This is Joule's law of heating.",
        "The heat produced in a resistor is (i) directly proportional to the square of the current for a given resistance, (ii) directly proportional to the resistance for a given current, and (iii) directly proportional to the time for which the current flows.",
        "11.7.1: The electric laundry iron, electric toaster, oven, kettle and heater are based on Joule heating. Heating is also unavoidable in circuits, and is often undesirable, as it converts useful electrical energy into heat and can alter the properties of components.",
        "Electric bulb: the filament must retain as much of the heat as possible, so that it gets very hot and emits light, without melting. Tungsten (melting point 3380 °C) is used. The filament is thermally isolated with insulating supports, and the bulb is filled with chemically inactive nitrogen and argon to prolong its life. Most of the power consumed appears as heat; only a small part is radiated as light.",
        "Electric fuse: it protects circuits and appliances by stopping the flow of any unduly high current. It is placed in series with the device and is a wire of a metal or alloy of appropriate melting point (aluminium, copper, iron, lead, etc.), usually in a porcelain cartridge with metal ends. Too large a current melts the wire and breaks the circuit.",
        "Fuses for domestic purposes are rated 1 A, 2 A, 3 A, 5 A, 10 A, etc. An electric iron of 1 kW operated at 220 V draws 1000/220 A, about 4.5 A, so a 5 A fuse must be used."
      ],
      formulas: [["Joule's law of heating", "H = I²Rt"], ["Heat produced (energy supplied)", "H = VIt"], ["Power input", "P = VI"]],
      examples: [
        { n: "11.10", q: "An electric iron consumes energy at a rate of 840 W when heating is at the maximum rate and 360 W when the heating is at the minimum. The voltage is 220 V. What are the current and the resistance in each case?",
          solution: ["P = VI, so I = P/V.", "Maximum heating: I = 840 W/220 V = 3.82 A; R = V/I = 220 V/3.82 A = 57.60 Ω.", "Minimum heating: I = 360 W/220 V = 1.64 A; R = 220 V/1.64 A = 134.15 Ω.", "(Using R = V²/P directly gives 57.6 Ω and 134.4 Ω; NCERT rounds the current first.)"],
          answer: "3.82 A and 57.6 Ω at the maximum; 1.64 A and 134 Ω at the minimum.", setup: { mode: "joule", I: 3.82, R: 57.6, t: 1 } },
        { n: "11.11", q: "100 J of heat is produced each second in a 4 Ω resistance. Find the potential difference across the resistor.",
          solution: ["H = 100 J, R = 4 Ω, t = 1 s.", "H = I²Rt, so I = √(H/Rt) = √(100 J ÷ (4 Ω × 1 s)) = 5 A.", "V = IR = 5 A × 4 Ω = 20 V."], answer: "20 V.", setup: { mode: "joule", I: 5, R: 4, t: 1 } }
      ],
      questions: [
        { tag: "In-text", q: "Why does the cord of an electric heater not glow while the heating element does?", a: "The same current flows through both, but the cord is made of copper, which has a very low resistance, while the element (an alloy such as nichrome) has a high resistance. By H = I²Rt, far more heat is produced in the element, so it glows and the cord does not." },
        { tag: "In-text", q: "Compute the heat generated while transferring 96000 coulomb of charge in one hour through a potential difference of 50 V.", a: "H = VIt = VQ = 50 V × 96000 C = 4.8 × 10⁶ J.", setup: { mode: "joule", I: 26.6667, R: 1.875, t: 3600 } },
        { tag: "In-text", q: "An electric iron of resistance 20 Ω takes a current of 5 A. Calculate the heat developed in 30 s.", a: "H = I²Rt = (5 A)² × 20 Ω × 30 s = 15000 J = 1.5 × 10⁴ J.", setup: { mode: "joule", I: 5, R: 20, t: 30 } },
        { tag: "Exercise 4", q: "Two conducting wires of the same material and of equal lengths and equal diameters are first connected in series and then parallel in a circuit across the same potential difference. The ratio of heat produced in series and parallel combinations would be", options: ["1:2", "2:1", "1:4", "4:1"], a: ["(c) 1:4.", "Each wire has resistance R. Series: 2R; parallel: R/2. With the same V and time, H = V²t/R, so H(series) : H(parallel) = (1/2R) : (2/R) = 1 : 4."] },
        { tag: "Exercise 17", q: "An electric heater of resistance 8 Ω draws 15 A from the service mains 2 hours. Calculate the rate at which heat is developed in the heater.", a: "Rate of heat production = P = I²R = (15 A)² × 8 Ω = 1800 W, that is, 1800 J every second. (In 2 hours: H = 1800 W × 7200 s = 1.3 × 10⁷ J.)", setup: { mode: "joule", I: 15, R: 8, t: 7200 } },
        { tag: "Exercise 18 (a)", q: "Why is the tungsten used almost exclusively for filament of electric lamps?", a: "The filament must get very hot to emit light without melting. Tungsten is a strong metal with a very high melting point (3380 °C), so it can glow white hot without melting.", setup: { mode: "bulb", Vb: 220 } },
        { tag: "From the text", q: "Which fuse should be used for an electric iron of 1 kW operated at 220 V?", a: "I = P/V = 1000 W/220 V ≈ 4.5 A, so a 5 A fuse.", setup: { mode: "fuse", P: 1000, fuse: 5, on: true } }
      ]
    },
    /* ---------------- 11.8 ---------------- */
    {
      id: "power", num: "11.8", title: "Electric power", chip: "Power",
      lead: "A bulb rated for 220 V on any supply voltage, energy and its cost, and a home electricity bill.",
      sim: ["elecPower", { mode: "rated", Vr: 220, Pr: 100, Vs: 220 }],
      explain: [
        "The rate of doing work is power. This is also the rate of consumption of energy. The rate at which electric energy is dissipated or consumed in an electric circuit is called electric power.",
        "Electric power: P = VI, or P = I²R = V²/R.",
        "The SI unit of electric power is the watt (W). It is the power consumed by a device that carries 1 A of current when operated at a potential difference of 1 V: 1 W = 1 volt × 1 ampere = 1 V A.",
        "The watt is a very small unit, so in practice a much larger unit, the kilowatt (1000 watts), is used.",
        "Electrical energy is the product of power and time, so its unit is the watt hour (W h): the energy consumed when 1 watt of power is used for 1 hour.",
        "The commercial unit of electric energy is the kilowatt hour (kW h), commonly known as a ‘unit’. 1 kW h = 1000 watt × 3600 second = 3.6 × 10⁶ watt second = 3.6 × 10⁶ joule (J)."
      ],
      formulas: [["Electric power", "P = VI = I²R = V²/R"], ["Unit of power", "1 W = 1 V A"], ["Electrical energy", "W = V × I × t = P × t"], ["Commercial unit of energy", "1 kW h = 3.6 × 10⁶ J"]],
      boxes: [{ title: "More to know (NCERT)", text: "Many people think that electrons are consumed in an electric circuit. This is wrong! We pay the electricity board or electric company to provide energy to move electrons through the electric gadgets like electric bulb, fan and engines. We pay for the energy that we use." }],
      examples: [
        { n: "11.12", q: "An electric bulb is connected to a 220 V generator. The current is 0.50 A. What is the power of the bulb?",
          solution: ["P = VI = 220 V × 0.50 A = 110 J/s = 110 W."], answer: "110 W.", setup: { mode: "rated", Vr: 220, Pr: 110, Vs: 220 } },
        { n: "11.13", q: "An electric refrigerator rated 400 W operates 8 hour/day. What is the cost of the energy to operate it for 30 days at Rs 3.00 per kW h?",
          solution: ["Total energy consumed in 30 days = 400 W × 8.0 h/day × 30 days = 96000 W h = 96 kW h.", "Cost = 96 kW h × Rs 3.00 per kW h = Rs 288.00."], answer: "Rs 288.", setup: { mode: "energy", eP: 400, eH: 8, eD: 30, rate: 3 } }
      ],
      questions: [
        { tag: "In-text", q: "What determines the rate at which energy is delivered by a current?", a: "The electric power, P = VI: the rate depends on the potential difference and the current (P = VI = I²R = V²/R)." },
        { tag: "In-text", q: "An electric motor takes 5 A from a 220 V line. Determine the power of the motor and the energy consumed in 2 h.", a: ["P = VI = 220 V × 5 A = 1100 W.", "Energy = P × t = 1100 W × 2 h = 2200 W h = 2.2 kW h = 2.2 × 3.6 × 10⁶ J = 7.92 × 10⁶ J."], setup: { mode: "energy", eP: 1100, eH: 2, eD: 1, rate: 3 } },
        { tag: "Exercise 2", q: "Which of the following terms does not represent electrical power in a circuit?", options: ["I²R", "IR²", "VI", "V²/R"], a: "(b) IR². Power is P = VI = I²R = V²/R." },
        { tag: "Exercise 3", q: "An electric bulb is rated 220 V and 100 W. When it is operated on 110 V, the power consumed will be", options: ["100 W", "75 W", "50 W", "25 W"], a: ["(d) 25 W.", "R = V²/P = (220 V)²/100 W = 484 Ω. At 110 V: P = V²/R = (110 V)²/484 Ω = 25 W."], setup: { mode: "rated", Vr: 220, Pr: 100, Vs: 110 } },
        { tag: "Exercise 14", q: "Compare the power used in the 2 Ω resistor in each of the following circuits: (i) a 6 V battery in series with 1 Ω and 2 Ω resistors, and (ii) a 4 V battery in parallel with 12 Ω and 2 Ω resistors.", a: ["(i) R = 1 + 2 = 3 Ω, I = 6 V/3 Ω = 2 A. Power in 2 Ω: P = I²R = (2 A)² × 2 Ω = 8 W.", "(ii) The 2 Ω resistor has the full 4 V across it: P = V²/R = (4 V)²/2 Ω = 8 W.", "The power used is the same, 8 W, in both circuits."], topic: "series", setup: { mode: "series", n: 2, R: [1, 2], V: 6, vm: 1 } },
        { tag: "Exercise 15", q: "Two lamps, one rated 100 W at 220 V, and the other 60 W at 220 V, are connected in parallel to electric mains supply. What current is drawn from the line if the supply voltage is 220 V?", a: ["In parallel each lamp gets 220 V and uses its rated power: total P = 100 W + 60 W = 160 W.", "I = P/V = 160 W/220 V = 0.73 A."], topic: "parallel", setup: { mode: "parallel", n: 2, R: [484, 806.67], V: 220, view: "bulb" } },
        { tag: "Exercise 16", q: "Which uses more energy, a 250 W TV set in 1 hr, or a 1200 W toaster in 10 minutes?", a: ["TV: E = Pt = 250 W × 3600 s = 9.0 × 10⁵ J.", "Toaster: E = 1200 W × 600 s = 7.2 × 10⁵ J.", "The TV set uses more energy."], setup: { mode: "energy", aP: 250, aT: 60, bP: 1200, bT: 10 } }
      ]
    }
  ],
  exercises: [
    { n: 1, q: "A piece of wire of resistance R is cut into five equal parts. These parts are then connected in parallel. If the equivalent resistance of this combination is R′, then the ratio R/R′ is –", options: ["1/25", "1/5", "5", "25"], a: ["(d) 25.", "Each part has resistance R/5. Five of them in parallel: R′ = (R/5)/5 = R/25, so R/R′ = 25."] },
    { n: 2, q: "Which of the following terms does not represent electrical power in a circuit?", options: ["I²R", "IR²", "VI", "V²/R"], a: "(b) IR²." },
    { n: 3, q: "An electric bulb is rated 220 V and 100 W. When it is operated on 110 V, the power consumed will be –", options: ["100 W", "75 W", "50 W", "25 W"], a: ["(d) 25 W.", "R = (220 V)²/100 W = 484 Ω; P = (110 V)²/484 Ω = 25 W."], go: { topic: "power", setup: { mode: "rated", Vr: 220, Pr: 100, Vs: 110 } } },
    { n: 4, q: "Two conducting wires of the same material and of equal lengths and equal diameters are first connected in series and then parallel in a circuit across the same potential difference. The ratio of heat produced in series and parallel combinations would be –", options: ["1:2", "2:1", "1:4", "4:1"], a: ["(c) 1:4.", "Series: 2R; parallel: R/2. H = V²t/R, so H(series) : H(parallel) = (R/2) : (2R) = 1 : 4."] },
    { n: 5, q: "How is a voltmeter connected in the circuit to measure the potential difference between two points?", a: "In parallel, across the two points.", go: { topic: "potential", setup: { mode: "pd", V: 6, Q: 1 } } },
    { n: 6, q: "A copper wire has diameter 0.5 mm and resistivity of 1.6 × 10⁻⁸ Ω m. What will be the length of this wire to make its resistance 10 Ω? How much does the resistance change if the diameter is doubled?", a: ["A = πd²/4 = 3.14 × (5 × 10⁻⁴ m)²/4 = 1.96 × 10⁻⁷ m². l = RA/ρ = (10 × 1.96 × 10⁻⁷)/(1.6 × 10⁻⁸) m = 122.7 m.", "Doubling the diameter makes the area 4 times, so the resistance becomes one-fourth: 2.5 Ω."], go: { topic: "resistance", setup: { mode: "free", mat: "custom", rho: 1.6, L: 122.7, d: 0.5 } } },
    { n: 7, q: "The values of current I flowing in a given resistor for the corresponding values of potential difference V across the resistor are given below – I (amperes) 0.5, 1.0, 2.0, 3.0, 4.0; V (volts) 1.6, 3.4, 6.7, 10.2, 13.2. Plot a graph between V and I and calculate the resistance of that resistor.", a: "The V–I graph is a straight line through the origin; its slope gives R ≈ 3.3–3.4 Ω.", go: { topic: "ohm", setup: { mode: "ex7" } } },
    { n: 8, q: "When a 12 V battery is connected across an unknown resistor, there is a current of 2.5 mA in the circuit. Find the value of the resistance of the resistor.", a: "R = V/I = 12 V/(2.5 × 10⁻³ A) = 4800 Ω = 4.8 kΩ." },
    { n: 9, q: "A battery of 9 V is connected in series with resistors of 0.2 Ω, 0.3 Ω, 0.4 Ω, 0.5 Ω and 12 Ω, respectively. How much current would flow through the 12 Ω resistor?", a: "Rs = 13.4 Ω; I = 9 V/13.4 Ω = 0.67 A, the same through every resistor, including the 12 Ω one.", go: { topic: "series", setup: { mode: "series", n: 5, R: [0.2, 0.3, 0.4, 0.5, 12], V: 9, vm: 4 } } },
    { n: 10, q: "How many 176 Ω resistors (in parallel) are required to carry 5 A on a 220 V line?", a: "Each carries 220 V/176 Ω = 1.25 A, so 5 A/1.25 A = 4 resistors.", go: { topic: "parallel", setup: { mode: "parallel", n: 4, R: [176, 176, 176, 176], V: 220 } } },
    { n: 11, q: "Show how you would connect three resistors, each of resistance 6 Ω, so that the combination has a resistance of (i) 9 Ω, (ii) 4 Ω.", a: ["(i) Two in parallel (3 Ω) in series with the third: 9 Ω.", "(ii) Two in series (12 Ω) in parallel with the third: 4 Ω."], go: { topic: "parallel", setup: { mode: "combo", nA: 2, nB: 1, R: [6, 6, 6], V: 9 } } },
    { n: 12, q: "Several electric bulbs designed to be used on a 220 V electric supply line, are rated 10 W. How many lamps can be connected in parallel with each other across the two wires of 220 V line if the maximum allowable current is 5 A?", a: "Each lamp draws 10 W/220 V = 1/22 A, so 5 A ÷ (1/22 A) = 110 lamps." },
    { n: 13, q: "A hot plate of an electric oven connected to a 220 V line has two resistance coils A and B, each of 24 Ω resistance, which may be used separately, in series, or in parallel. What are the currents in the three cases?", a: "Separately: 220/24 = 9.17 A. In series (48 Ω): 4.58 A. In parallel (12 Ω): 18.33 A.", go: { topic: "parallel", setup: { mode: "parallel", n: 2, R: [24, 24], V: 220 } } },
    { n: 14, q: "Compare the power used in the 2 Ω resistor in each of the following circuits: (i) a 6 V battery in series with 1 Ω and 2 Ω resistors, and (ii) a 4 V battery in parallel with 12 Ω and 2 Ω resistors.", a: ["(i) I = 6 V/3 Ω = 2 A, P = I²R = 8 W.", "(ii) V = 4 V across 2 Ω, P = V²/R = 8 W. The power is the same in both."], go: { topic: "series", setup: { mode: "series", n: 2, R: [1, 2], V: 6, vm: 1 } } },
    { n: 15, q: "Two lamps, one rated 100 W at 220 V, and the other 60 W at 220 V, are connected in parallel to electric mains supply. What current is drawn from the line if the supply voltage is 220 V?", a: "Total power 160 W, so I = 160 W/220 V = 0.73 A.", go: { topic: "parallel", setup: { mode: "parallel", n: 2, R: [484, 806.67], V: 220, view: "bulb" } } },
    { n: 16, q: "Which uses more energy, a 250 W TV set in 1 hr, or a 1200 W toaster in 10 minutes?", a: "TV: 250 W × 3600 s = 9.0 × 10⁵ J. Toaster: 1200 W × 600 s = 7.2 × 10⁵ J. The TV set uses more energy.", go: { topic: "power", setup: { mode: "energy", aP: 250, aT: 60, bP: 1200, bT: 10 } } },
    { n: 17, q: "An electric heater of resistance 8 Ω draws 15 A from the service mains 2 hours. Calculate the rate at which heat is developed in the heater.", a: "P = I²R = (15 A)² × 8 Ω = 1800 W: heat is developed at 1800 J per second.", go: { topic: "heating", setup: { mode: "joule", I: 15, R: 8, t: 7200 } } },
    { n: 18, q: "Explain the following. (a) Why is the tungsten used almost exclusively for filament of electric lamps? (b) Why are the conductors of electric heating devices, such as bread-toasters and electric irons, made of an alloy rather than a pure metal? (c) Why is the series arrangement not used for domestic circuits? (d) How does the resistance of a wire vary with its area of cross-section? (e) Why are copper and aluminium wires usually employed for electricity transmission?", a: ["(a) Tungsten has a very high melting point (3380 °C), so the filament can be heated until it glows white hot without melting.", "(b) An alloy has a higher resistivity than its constituent metals and does not oxidise (burn) readily at high temperatures.", "(c) In series the same current flows through all appliances, though they need very different currents; the total resistance becomes large; and if one appliance fails or is switched off, all of them stop. Each appliance also cannot get the full 220 V.", "(d) Resistance is inversely proportional to the area of cross-section (R ∝ 1/A): a thicker wire has less resistance.", "(e) They have very low resistivity, so very little energy is lost as heat in the transmission wires."], go: { topic: "heating", setup: { mode: "bulb", Vb: 220 } } }
  ],
  summary: [
    "A stream of electrons moving through a conductor constitutes an electric current. Conventionally, the direction of current is taken opposite to the direction of flow of electrons.",
    "The SI unit of electric current is ampere.",
    "To set the electrons in motion in an electric circuit, we use a cell or a battery. A cell generates a potential difference across its terminals. It is measured in volts (V).",
    "Resistance is a property that resists the flow of electrons in a conductor. It controls the magnitude of the current. The SI unit of resistance is ohm (Ω).",
    "Ohm's law: The potential difference across the ends of a resistor is directly proportional to the current through it, provided its temperature remains the same.",
    "The resistance of a conductor depends directly on its length, inversely on its area of cross-section, and also on the material of the conductor.",
    "The equivalent resistance of several resistors in series is equal to the sum of their individual resistances.",
    "A set of resistors connected in parallel has an equivalent resistance Rp given by 1/Rp = 1/R₁ + 1/R₂ + 1/R₃ + …",
    "The electrical energy dissipated in a resistor is given by W = V × I × t.",
    "The unit of power is watt (W). One watt of power is consumed when 1 A of current flows at a potential difference of 1 V.",
    "The commercial unit of electrical energy is kilowatt hour (kWh). 1 kW h = 3,600,000 J = 3.6 × 10⁶ J."
  ]
});
