/* ============================================================
   Chapter 12 — Magnetic Effects of Electric Current (content)
   ============================================================ */
"use strict";
CR.chapters.push({
  "id": "magnetism",
  "num": 12,
  "short": "Magnetic Effects",
  "title": "Magnetic Effects of Electric Current",
  "notes": "../magnetic-effects.html",
  "topics": [
    {
      "id": "field",
      "num": "12.1–12.2",
      "title": "Field lines and the compass",
      "chip": "Field lines and the compass",
      "lead": "Choose a conductor. Drag the compass around, reverse the current, and turn up the current to crowd the lines.",
      "sim": [
        "field",
        {}
      ],
      "explain": [
        "Oersted showed that a current in a wire deflects a compass needle: an electric current produces a magnetic field.",
        "Outside a magnet, field lines emerge from the north pole and merge at the south pole; inside, they go from south to north. So field lines are closed curves.",
        "The direction of the field at a point is the direction a compass's north pole points there (the tangent to the field line). Field lines never cross. Where they are crowded, the field is stronger.",
        "Straight wire: the field lines are concentric circles. Right-hand thumb rule: hold the wire with the thumb along the current; the fingers curl in the direction of the field. The field increases with current and decreases with distance from the wire.",
        "Circular loop: near the centre the field lines are almost straight. A coil of n turns gives a field n times as large as a single turn.",
        "Solenoid: the field inside is uniform (parallel lines), and the solenoid behaves like a bar magnet. A soft iron core inside makes an electromagnet."
      ],
      "formulas": [
        [
          "Straight wire",
          "B ∝ I and B ∝ 1/r"
        ],
        [
          "Coil of n turns",
          "field n times that of one turn"
        ],
        [
          "Inside a solenoid",
          "uniform field"
        ]
      ],
      "questions": [
        {
          "q": "Why don't two magnetic field lines ever cross?",
          "a": "At a crossing point the compass needle would point in two directions at once, which is impossible."
        },
        {
          "q": "A current in a horizontal power line flows from east to west. What is the direction of the magnetic field at a point directly below it and directly above it?",
          "a": "Using the right-hand thumb rule: directly below the line the field points south; directly above it the field points north."
        },
        {
          "q": "A circular loop of wire lies on a table and the current flows clockwise (seen from above). What is the direction of the field inside and outside the loop?",
          "a": "Inside the loop the field points down into the table; outside the loop it points up out of the table."
        },
        {
          "q": "How does the field near a long straight wire change if (a) the current doubles (b) the distance from the wire doubles?",
          "a": "(a) It doubles. (b) It halves."
        },
        {
          "q": "What is the magnetic field like inside a long solenoid carrying current?",
          "a": "It is the same at all points (uniform), shown by parallel field lines."
        },
        {
          "q": "Give two ways to make an electromagnet stronger.",
          "a": "Increase the current, increase the number of turns, or use a soft iron core."
        }
      ]
    },
    {
      "id": "force",
      "num": "12.3",
      "title": "Force on a conductor",
      "chip": "Force on a conductor",
      "lead": "Based on NCERT Activity 12.7 (a current-carrying rod between the poles of a horseshoe magnet), seen end-on. Here the magnet lies on its side, so the field is horizontal.",
      "sim": [
        "fleming",
        {}
      ],
      "explain": [
        "A current-carrying conductor placed in a magnetic field experiences a force.",
        "The force is largest when the current is at right angles to the field, and zero when the current is along the field.",
        "Reversing the current, or reversing the field, reverses the direction of the force.",
        "Fleming's left-hand rule: stretch the thumb, forefinger and middle finger of the left hand so they are mutually perpendicular. If the forefinger points along the field and the middle finger along the current, the thumb points along the force (motion).",
        "Electric motors and loudspeakers use this force."
      ],
      "formulas": [
        [
          "Direction",
          "F ⟂ I and F ⟂ B"
        ],
        [
          "Largest force",
          "when I ⟂ B"
        ],
        [
          "No force",
          "when I is along B"
        ]
      ],
      "questions": [
        {
          "q": "A positively charged particle (alpha particle) moving towards the west is deflected towards the north by a magnetic field. What is the direction of the field?",
          "a": "Upwards. With the middle finger west (current) and the thumb north (force), the forefinger points up."
        },
        {
          "q": "When is the force on a current-carrying conductor in a magnetic field the largest?",
          "a": "When the current is at right angles to the magnetic field."
        },
        {
          "q": "What happens to the force if both the current and the field are reversed?",
          "a": "Its direction stays the same."
        },
        {
          "q": "A proton moves freely in a magnetic field. Which of these can change: its mass, speed, velocity or momentum?",
          "a": "Its velocity and momentum (their direction changes). Its mass and speed do not change."
        },
        {
          "q": "Name two devices that use the force on a current-carrying conductor in a magnetic field.",
          "a": "An electric motor and a loudspeaker."
        }
      ]
    },
    {
      "id": "domestic",
      "num": "12.4",
      "title": "Domestic circuits and the fuse",
      "chip": "Domestic circuits and the fuse",
      "lead": "Add appliances until the fuse blows. Try the 15 A circuit, and try a short circuit.",
      "sim": [
        "domestic",
        {}
      ],
      "explain": [
        "In India the mains supply is AC at 220 V and 50 Hz: the current changes direction every 1/100 second.",
        "An advantage of AC over DC: electric power can be transmitted over long distances without much loss of energy.",
        "The supply uses a live wire (usually red insulation), a neutral wire (black) and an earth wire (green). The potential difference between live and neutral is 220 V.",
        "Appliances are connected in parallel, so each gets 220 V and can be switched on or off independently. Usually there is a 15 A circuit for high-power appliances (geysers, air coolers) and a 5 A circuit for bulbs and fans.",
        "Earthing: the metal body of an appliance is connected to the earth wire, a low-resistance path. Any leakage current goes to earth and the body stays at the earth's potential, so the user does not get a severe shock.",
        "A fuse is connected in series in the live wire. If the current becomes too large it melts and breaks the circuit, protecting the wiring and appliances.",
        "Short circuit: the live and neutral wires touch directly (damaged insulation or a faulty appliance). The current suddenly becomes very large.",
        "Overloading: too many appliances on one socket, or a sudden rise in supply voltage, makes the current too large."
      ],
      "formulas": [
        [
          "Current drawn",
          "I = P / V"
        ],
        [
          "Total power (parallel)",
          "P = P₁ + P₂ + …"
        ],
        [
          "Mains in India",
          "220 V AC, 50 Hz"
        ]
      ],
      "questions": [
        {
          "q": "An electric oven of 2 kW is used in a domestic circuit (220 V) that has a current rating of 5 A. What result do you expect?",
          "a": "I = P/V = 2000/220 ≈ 9.1 A, which is more than 5 A. The circuit is overloaded and the fuse blows.",
          "setup": {
            "rating": 5,
            "counts": [
              0,
              0,
              0,
              0,
              0,
              1
            ]
          }
        },
        {
          "q": "What precautions should be taken to avoid overloading of domestic circuits?",
          "a": "Do not connect too many appliances to one socket, use separate 15 A circuits for high-power appliances, and use a fuse of the correct rating in the live wire."
        },
        {
          "q": "What is the function of an earth wire? Why should metal appliances be earthed?",
          "a": "The earth wire gives a low-resistance path to the earth. If current leaks to the metal body, it flows to earth and the body stays at the earth's potential, so a person touching it does not get a severe shock."
        },
        {
          "q": "What is a short circuit?",
          "a": "When the live and neutral wires come into direct contact, the resistance of the circuit becomes almost zero and the current suddenly becomes very large."
        },
        {
          "q": "Why is the fuse connected in the live wire?",
          "a": "So that when it melts, the appliance is disconnected from the live wire and is safe to touch."
        },
        {
          "q": "What is the frequency of AC in India, and what is one advantage of AC over DC?",
          "a": "50 Hz. AC can be transmitted over long distances without much loss of energy."
        }
      ]
    }
  ]
});
