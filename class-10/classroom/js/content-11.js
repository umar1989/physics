/* ============================================================
   Chapter 11 — Electricity (content)
   ============================================================ */
"use strict";
CR.chapters.push({
  "id": "electricity",
  "num": 11,
  "short": "Electricity",
  "title": "Electricity",
  "notes": "../electricity.html",
  "topics": [
    {
      "id": "ohm",
      "num": "11.1–11.4",
      "title": "Ohm's law",
      "chip": "Ohm's law",
      "lead": "Based on NCERT Activity 11.1. Use 1 to 4 cells, record each reading, and see the straight-line V–I graph.",
      "sim": [
        "ohm",
        {}
      ],
      "explain": [
        "Electric current is the rate of flow of charge: I = Q/t. Its SI unit is the ampere (A); 1 A = 1 C/s.",
        "Conventional current flows from + to − outside the cell. Electrons actually move the opposite way.",
        "Potential difference is the work done to move a unit charge between two points: V = W/Q. Its unit is the volt (V); 1 V = 1 J/C. A cell maintains the potential difference.",
        "An ammeter is connected in series in the circuit; a voltmeter is connected in parallel across the part being measured.",
        "Ohm's law: at constant temperature, the potential difference across a metallic wire is directly proportional to the current through it. V ∝ I, so V = IR.",
        "The V–I graph is a straight line through the origin, and V/I = R. A conductor has a resistance of 1 ohm when 1 A flows through it with 1 V across it."
      ],
      "formulas": [
        [
          "Current",
          "I = Q / t"
        ],
        [
          "Potential difference",
          "V = W / Q"
        ],
        [
          "Ohm's law",
          "V = IR"
        ],
        [
          "Charge",
          "Q = ne,  e = 1.6 × 10⁻¹⁹ C"
        ]
      ],
      "questions": [
        {
          "q": "How much current will an electric heater coil draw from a 220 V source, if its resistance is 100 Ω?",
          "a": "I = V/R = 220/100 = 2.2 A."
        },
        {
          "q": "How many electrons make up a charge of 1 coulomb?",
          "a": "n = Q/e = 1/(1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ electrons (NCERT rounds this to nearly 6 × 10¹⁸)."
        },
        {
          "q": "How much work is done in moving a charge of 2 C across two points with a potential difference of 12 V?",
          "a": "W = VQ = 12 V × 2 C = 24 J."
        },
        {
          "q": "On a V–I graph (V on the y-axis), one straight line is steeper than another. What does that show?",
          "a": "The steeper line belongs to the larger resistance, because the slope V/I equals R."
        },
        {
          "q": "Define 1 volt.",
          "a": "The potential difference between two points is 1 volt when 1 joule of work is done to move 1 coulomb of charge from one point to the other."
        }
      ]
    },
    {
      "id": "resistivity",
      "num": "11.5",
      "title": "Resistance and resistivity",
      "chip": "Resistance and resistivity",
      "lead": "Change the wire's length, thickness and material. Use the buttons to test R ∝ l and R ∝ 1/A.",
      "sim": [
        "resistivity",
        {}
      ],
      "explain": [
        "The resistance of a wire depends on its length, its area of cross-section, the nature of its material and its temperature.",
        "R ∝ l and R ∝ 1/A, so R = ρl/A. ρ (rho) is the resistivity of the material; its SI unit is Ω m.",
        "Resistivity is a property of the material. It does not change if the wire is made longer, shorter, thicker or thinner (at the same temperature).",
        "Metals such as copper and aluminium have very low resistivity, so they are used for connecting wires.",
        "Alloys such as nichrome have higher resistivity than their metals and do not oxidise (burn) readily at high temperatures, so they are used in heaters, irons and toasters.",
        "Doubling the diameter makes the area 4 times, so R becomes one-fourth."
      ],
      "formulas": [
        [
          "Resistance",
          "R = ρl / A"
        ],
        [
          "Area of a wire",
          "A = πr² = πd²/4"
        ],
        [
          "Unit of resistivity",
          "Ω m"
        ]
      ],
      "questions": [
        {
          "q": "The length of a wire is doubled, keeping the same area of cross-section. What happens to its resistance?",
          "a": "It doubles, because R ∝ l. (If the same wire is stretched to twice its length, its area also halves, so R becomes 4 times.)"
        },
        {
          "q": "Why are the coils of electric toasters and irons made of an alloy rather than a pure metal?",
          "a": "An alloy has a higher resistivity than its constituent metals and does not oxidise (burn) readily at high temperatures."
        },
        {
          "q": "Why is tungsten used almost exclusively for the filaments of electric lamps?",
          "a": "Tungsten has a very high melting point (3380 °C), so it can glow white-hot without melting."
        },
        {
          "q": "A 1 m metal wire of diameter 0.3 mm has a resistance of 26 Ω at 20 °C. Find its resistivity. Which material is it, from NCERT Table 11.2?",
          "a": "A = π(0.15 × 10⁻³ m)² = 7.07 × 10⁻⁸ m². ρ = RA/l = 26 × 7.07 × 10⁻⁸ / 1 ≈ 1.84 × 10⁻⁶ Ω m, which matches manganese in Table 11.2."
        },
        {
          "q": "A copper wire has diameter 0.5 mm and resistivity 1.6 × 10⁻⁸ Ω m. What length gives a resistance of 10 Ω? How does the resistance change if the diameter is doubled?",
          "a": "A = π(0.25 × 10⁻³ m)² = 1.96 × 10⁻⁷ m². l = RA/ρ = (10 × 1.96 × 10⁻⁷)/(1.6 × 10⁻⁸) ≈ 122.7 m. Doubling the diameter makes A four times, so R becomes one-fourth: 2.5 Ω."
        }
      ]
    },
    {
      "id": "combinations",
      "num": "11.6",
      "title": "Series and parallel",
      "chip": "Series and parallel",
      "lead": "Change the resistances and the connection. Remove a bulb and see what happens to the others.",
      "sim": [
        "circuits",
        {}
      ],
      "explain": [
        "Series: the same current flows through every resistor, and the potential differences add up. Rs = R₁ + R₂ + R₃, which is more than the largest resistance.",
        "Parallel: every resistor has the same potential difference, and the currents add up. 1/Rp = 1/R₁ + 1/R₂ + 1/R₃, so Rp is less than the smallest resistance.",
        "In series, if one bulb fails or is removed the circuit breaks and every bulb goes off. In parallel, the others keep working.",
        "Houses are wired in parallel: each appliance gets the full voltage, draws the current it needs, and can be switched on or off by itself.",
        "Brightness check: in series the bulb with the larger R glows more (same I, P = I²R). In parallel the bulb with the smaller R glows more (same V, P = V²/R)."
      ],
      "formulas": [
        [
          "Series",
          "Rs = R₁ + R₂ + R₃"
        ],
        [
          "Parallel",
          "1/Rp = 1/R₁ + 1/R₂ + 1/R₃"
        ],
        [
          "Series: voltages add",
          "V = V₁ + V₂ + V₃"
        ],
        [
          "Parallel: currents add",
          "I = I₁ + I₂ + I₃"
        ]
      ],
      "questions": [
        {
          "q": "Resistors of 5 Ω, 10 Ω and 30 Ω are connected in parallel to a 12 V battery. Find the current through each, the total current and the total resistance.",
          "a": "I₁ = 12/5 = 2.4 A, I₂ = 12/10 = 1.2 A, I₃ = 12/30 = 0.4 A. Total I = 4.0 A. Rp = V/I = 12/4 = 3 Ω.",
          "setup": {
            "mode": "parallel",
            "V": 12,
            "R": [
              5,
              10,
              30
            ]
          }
        },
        {
          "q": "How can three resistors of 2 Ω, 3 Ω and 6 Ω be connected to give a total resistance of (a) 4 Ω (b) 1 Ω?",
          "a": "(a) 3 Ω and 6 Ω in parallel give 2 Ω; put this in series with 2 Ω to get 4 Ω. (b) All three in parallel: 1/2 + 1/3 + 1/6 = 1, so 1 Ω."
        },
        {
          "q": "Judge the equivalent resistance when (a) 1 Ω and 10⁶ Ω (b) 1 Ω, 10³ Ω and 10⁶ Ω are connected in parallel.",
          "a": "In both cases it is slightly less than 1 Ω, because a parallel combination is always less than its smallest resistance."
        },
        {
          "q": "Why are household appliances connected in parallel and not in series?",
          "a": "Each appliance gets the full 220 V, draws only the current it needs, and can be switched on or off without affecting the others. In series, one failure would switch everything off."
        },
        {
          "q": "In series, which bulb glows brighter: the one with larger R or smaller R? And in parallel?",
          "a": "Series: larger R (same current, P = I²R). Parallel: smaller R (same voltage, P = V²/R).",
          "setup": {
            "mode": "series",
            "V": 9,
            "R": [
              4,
              8,
              16
            ]
          }
        }
      ]
    },
    {
      "id": "power",
      "num": "11.7–11.8",
      "title": "Heating effect and power",
      "chip": "Heating effect and power",
      "lead": "Fill in a home's appliances to estimate the monthly bill. Then use the heater calculator below it.",
      "sim": [
        "elecPower",
        {}
      ],
      "explain": [
        "Joule's law of heating: H = I²Rt. The heat produced is proportional to the square of the current, to the resistance and to the time.",
        "The heating effect is used in electric heaters, irons, toasters, bulb filaments and fuses.",
        "Electric power is the rate at which electrical energy is used: P = VI = I²R = V²/R. Its unit is the watt (W); 1 W = 1 V × 1 A.",
        "The commercial unit of energy is the kilowatt hour (kWh): 1 kWh = 3.6 × 10⁶ J. One kWh is one “unit” on an electricity bill.",
        "Energy used = power × time. For example, a 1000 W iron used for 1 hour uses 1 kWh."
      ],
      "formulas": [
        [
          "Joule's law",
          "H = I²Rt"
        ],
        [
          "Power",
          "P = VI = I²R = V²/R"
        ],
        [
          "Energy",
          "E = P × t"
        ],
        [
          "Commercial unit",
          "1 kWh = 3.6 × 10⁶ J"
        ]
      ],
      "questions": [
        {
          "q": "A refrigerator rated 400 W works 8 hours a day. What is the cost of running it for 30 days at ₹3.00 per kWh?",
          "a": "Energy = 0.4 kW × 8 h × 30 = 96 kWh. Cost = 96 × ₹3.00 = ₹288."
        },
        {
          "q": "Compute the heat produced when 96000 C of charge is transferred in one hour through a potential difference of 50 V.",
          "a": "H = VQ = 50 V × 96000 C = 4.8 × 10⁶ J."
        },
        {
          "q": "Two lamps rated 100 W and 60 W at 220 V are connected in parallel to the 220 V mains. What current is drawn from the line?",
          "a": "Total power = 160 W, so I = P/V = 160/220 ≈ 0.73 A."
        },
        {
          "q": "Which uses more energy: a 250 W TV set in 1 hour, or a 1200 W toaster in 10 minutes?",
          "a": "TV: 250 W × 3600 s = 9.0 × 10⁵ J. Toaster: 1200 W × 600 s = 7.2 × 10⁵ J. The TV uses more."
        },
        {
          "q": "An electric heater of resistance 8 Ω draws 15 A from the mains for 2 hours. At what rate is heat produced?",
          "a": "P = I²R = 15² × 8 = 1800 W = 1.8 kW (1800 J every second)."
        },
        {
          "q": "Why does the cord of an electric heater not glow while the heating element does?",
          "a": "The cord is made of copper, which has very low resistance, while the element has high resistance, so far more heat (I²Rt) is produced in the element."
        }
      ]
    }
  ]
});
