/* ============================================================
   Chapter 12 — Magnetic Effects of Electric Current (NCERT, rationalised)
   ============================================================ */
"use strict";
CR.chapters.push({
  id: "magnetism", num: 12, short: "Magnetic Effects", title: "Magnetic Effects of Electric Current", notes: "../magnetic-effects.html",
  topics: [
    /* ---------------- chapter opening ---------------- */
    {
      id: "oersted", num: "Intro", title: "Magnetic effect of electric current", chip: "Activity 12.1",
      lead: "Activity 12.1 (Fig. 12.1): wire XY is perpendicular to the paper and a small compass lies near it. Note where the needle points, insert the key, and watch the needle. Drag the compass to other places round the wire.",
      sim: ["oersted", { mode: "a121", lock: true, on: false }],
      explain: [
        "In the previous chapter we learnt about the heating effect of electric current. An electric current also has a magnetic effect.",
        "When a current is passed through a metallic wire placed near a compass needle, the needle is deflected (Activity 12.1, Fig. 12.1).",
        "This means that the electric current through the copper wire has produced a magnetic effect. Thus electricity and magnetism are linked to each other.",
        "NCERT then asks about the reverse possibility: is there an electric effect of moving magnets? (This is studied in higher classes.)",
        "In this chapter we study magnetic fields and the effects produced by currents: the fields of a straight wire, a loop and a solenoid, the force on a current-carrying conductor in a magnetic field, and domestic electric circuits."
      ],
      boxes: [{ title: "Hans Christian Oersted (1777–1851)", text: "Hans Christian Oersted, one of the leading scientists of the 19th century, played a crucial role in understanding electromagnetism. In 1820 he accidentally discovered that a compass needle got deflected when an electric current passed through a metallic wire placed nearby. Through this observation Oersted showed that electricity and magnetism were related phenomena. His research later created technologies such as the radio, television and fibre optics. The unit of magnetic field strength is named the oersted in his honour." }],
      activities: [
        { n: "12.1", title: "A compass needle near a current-carrying wire",
          steps: [
            "Take a straight thick copper wire and place it between the points X and Y in an electric circuit (Fig. 12.1). The wire XY is kept perpendicular to the plane of the paper.",
            "Horizontally place a small compass near to this copper wire. See the position of its needle.",
            "Pass the current through the circuit by inserting the key into the plug.",
            "Observe the change in the position of the compass needle."
          ],
          observe: "The needle is deflected. The electric current through the copper wire has produced a magnetic effect, so electricity and magnetism are linked to each other.",
          setup: { on: true, comp: { e: 0, n: 3 } } }
      ]
    },
    /* ---------------- 12.1 ---------------- */
    {
      id: "field-lines", num: "12.1", title: "Magnetic field and field lines", chip: "Field lines",
      lead: "A bar magnet on a sheet of paper. Show the iron filings of Activity 12.2, the field lines of Fig. 12.4 or a grid of compass needles. Drag the compass round the magnet, and trace a field line step by step as in Activity 12.3.",
      sim: ["field", { modes: ["magnet"], view: "filings" }],
      explain: [
        "A compass needle is, in fact, a small bar magnet. The ends of the compass needle point approximately towards north and south. The end pointing towards north is called the north-seeking or north pole; the other end is the south-seeking or south pole.",
        "Like poles repel, while unlike poles of magnets attract each other.",
        "Iron filings sprinkled round a bar magnet arrange themselves in a pattern (Activity 12.2, Fig. 12.2). The magnet exerts its influence in the region surrounding it, so the filings experience a force.",
        "The region surrounding a magnet, in which the force of the magnet can be detected, is said to have a magnetic field. The lines along which the iron filings align themselves represent magnetic field lines.",
        "A magnetic field has both direction and magnitude. The direction of the magnetic field is taken to be the direction in which a north pole of the compass needle moves inside it.",
        "Outside a magnet, field lines emerge from the north pole and merge at the south pole. Inside the magnet, their direction is from the south pole to the north pole. Thus magnetic field lines are closed curves.",
        "The relative strength of the magnetic field is shown by the degree of closeness of the field lines. The field is stronger where the field lines are crowded, as near the poles (Fig. 12.4).",
        "No two field lines are found to cross each other. If they did, a compass needle at the point of intersection would point in two directions, which is not possible."
      ],
      boxes: [{ title: "Properties of magnetic field lines", items: [
        "Outside a magnet they go from the north pole to the south pole; inside, from the south pole to the north pole. They are closed curves.",
        "The tangent to a field line at a point gives the direction of the field there (the way a compass needle's north pole points).",
        "They are crowded where the field is strong and spread out where it is weak.",
        "Two field lines never cross each other."
      ] }],
      activities: [
        { n: "12.2", title: "Iron filings round a bar magnet",
          steps: [
            "Fix a sheet of white paper on a drawing board using some adhesive material.",
            "Place a bar magnet in the centre of it.",
            "Sprinkle some iron filings uniformly around the bar magnet (Fig. 12.2). A salt-sprinkler may be used for this purpose.",
            "Now tap the board gently. What do you observe?"
          ],
          observe: "The iron filings arrange themselves in a pattern (Fig. 12.2). The force of the magnet makes the filings line up. The region round the magnet in which its force can be detected is its magnetic field, and the lines along which the filings align represent the magnetic field lines.",
          setup: { view: "filings" } },
        { n: "12.3", title: "Drawing field lines with a compass",
          steps: [
            "Take a small compass and a bar magnet.",
            "Place the magnet on a sheet of white paper fixed on a drawing board, using some adhesive material. Mark the boundary of the magnet.",
            "Place the compass near the north pole of the magnet. The south pole of the needle points towards the north pole of the magnet, and the north pole of the compass is directed away from it.",
            "Mark the positions of the two ends of the needle.",
            "Move the needle to a new position such that its south pole occupies the position previously occupied by its north pole. Proceed step by step till you reach the south pole of the magnet (Fig. 12.3).",
            "Join the points marked on the paper by a smooth curve. This curve represents a field line.",
            "Repeat the procedure and draw as many lines as you can. You get a pattern like Fig. 12.4."
          ],
          observe: "The curves drawn are the magnetic field lines around the magnet. As the compass is moved along a field line, the deflection of the needle increases as it is moved towards the poles.",
          setup: { view: "none", trace: true } }
      ],
      questions: [
        { tag: "In-text", q: "Why does a compass needle get deflected when brought near a bar magnet?",
          a: "A compass needle is itself a small magnet. Near a bar magnet it lies in the magnet's magnetic field, so forces act on its poles (like poles repel, unlike poles attract). These forces turn the needle until it lies along the field line at that point.",
          setup: { view: "compasses" } }
      ]
    },
    /* ---------------- 12.2 ---------------- */
    {
      id: "current-field", num: "12.2", title: "Magnetic field due to a current-carrying conductor", chip: "Activity 12.4",
      lead: "Activity 12.4 (Fig. 12.5): a long straight copper wire runs north to south over a compass needle. Insert the key, then reverse the current as in Fig. 12.5 (b).",
      sim: ["oersted", { mode: "a124", lock: true, on: false }],
      explain: [
        "In Activity 12.1 we saw that an electric current through a metallic conductor produces a magnetic field around it.",
        "To find out the direction of the field, place a long straight copper wire parallel to and over a compass needle, and pass a current through it (Activity 12.4, Fig. 12.5).",
        "If the current flows from north to south (Fig. 12.5 a), the north pole of the compass needle moves towards the east.",
        "If the cell connections are reversed so that the current flows from south to north (Fig. 12.5 b), the needle moves in the opposite direction, towards the west.",
        "So the direction of the magnetic field produced by an electric current depends on the direction of the current: reversing the current reverses the field."
      ],
      activities: [
        { n: "12.4", title: "Reversing the current reverses the field",
          steps: [
            "Take a long straight copper wire, two or three cells of 1.5 V each, and a plug key. Connect all of them in series (Fig. 12.5 a).",
            "Place the straight wire parallel to and over a compass needle.",
            "Plug the key in the circuit and observe the direction of deflection of the north pole of the needle.",
            "Replace the cell connections in the circuit (Fig. 12.5 b), so that the current through the copper wire now flows from south to north.",
            "Observe the change in the direction of deflection of the needle."
          ],
          observe: "When the current flows from north to south, the north pole of the needle moves towards the east. When the current flows from south to north, the needle moves towards the west. So the direction of the magnetic field produced by the current is reversed when the current is reversed.",
          setup: { on: true, dirH: 1 } }
      ]
    },
    /* ---------------- 12.2.1 ---------------- */
    {
      id: "straight-wire", num: "12.2.1", title: "Magnetic field due to a current through a straight conductor", chip: "Straight wire",
      lead: "Activity 12.5 (Fig. 12.6): a thick copper wire passes vertically through a cardboard sprinkled with iron filings. Put the compass at P and at Q, change the current, and reverse it.",
      sim: ["field", { modes: ["wire"], view: "filings" }],
      explain: [
        "The pattern of the magnetic field produced by a current depends on the shape of the conductor.",
        "Iron filings round a straight current-carrying wire align themselves in a pattern of concentric circles (Activity 12.5, Fig. 12.6). These circles represent the magnetic field lines.",
        "A compass placed at a point P on a circle shows the direction of the field there: the north pole of its needle gives the direction of the field line.",
        "If the direction of the current through the wire is reversed, the direction of the magnetic field lines is also reversed.",
        "If the current is increased, the deflection of the needle at a given point also increases: the magnitude of the magnetic field at a point increases as the current through the wire increases.",
        "If the compass is moved to a farther point Q with the same current, the deflection decreases: the magnetic field produced by a given current decreases as the distance from the wire increases.",
        "So the concentric circles representing the field round a current-carrying straight wire become larger and larger (and farther apart) as we move away from it."
      ],
      formulas: [["Straight wire: field and current", "B ∝ I"], ["Straight wire: field and distance", "B ∝ 1/r"]],
      activities: [
        { n: "12.5", title: "Field lines round a straight wire",
          steps: [
            "Take a battery (12 V), a variable resistance (or a rheostat), an ammeter (0–5 A), a plug key, connecting wires and a long straight thick copper wire.",
            "Insert the thick wire through the centre, normal to the plane of a rectangular cardboard. Take care that the cardboard is fixed and does not slide up or down.",
            "Connect the copper wire vertically between the points X and Y (Fig. 12.6 a), in series with the battery, a plug and a key.",
            "Sprinkle some iron filings uniformly on the cardboard (you may use a salt sprinkler).",
            "Keep the rheostat at a fixed position and note the current through the ammeter. Close the key, keeping the wire between X and Y vertically straight.",
            "Gently tap the cardboard a few times and observe the pattern of the iron filings.",
            "Place a compass at a point P over a circle and observe the direction of its needle. Reverse the current and check the direction again."
          ],
          observe: "The iron filings align in a pattern of concentric circles round the copper wire: these are the magnetic field lines. The north pole of the compass needle at P gives the direction of the field there. When the current is reversed, the direction of the field lines is reversed.",
          setup: { view: "filings", on: true, at: "P" } },
        { n: "12.5 (continued)", title: "Changing the current and the distance",
          steps: [
            "Keep the compass at P and change the current in the wire with the rheostat. Watch the deflection of the needle.",
            "Now keep the current the same and place the compass at a farther point Q."
          ],
          observe: "When the current is increased, the deflection increases: the field at a given point increases with the current. At Q the deflection is smaller: the field produced by a given current decreases as the distance from the wire increases.",
          setup: { view: "compasses", on: true, at: "Q" } }
      ],
      questions: [
        { tag: "Exercise 1", q: "Which of the following correctly describes the magnetic field near a long straight wire?",
          options: ["The field consists of straight lines perpendicular to the wire.", "The field consists of straight lines parallel to the wire.", "The field consists of radial lines originating from the wire.", "The field consists of concentric circles centred on the wire."],
          a: "(d) The field consists of concentric circles centred on the wire.", setup: { view: "lines", on: true } }
      ]
    },
    /* ---------------- 12.2.2 ---------------- */
    {
      id: "thumb-rule", num: "12.2.2", title: "Right-hand thumb rule", chip: "Thumb rule",
      lead: "Change the direction of the current and see which way the field lines go round the wire. Then look at the power line of Example 12.1, and at a loop lying on a table.",
      sim: ["thumbRule", { mode: "vertical" }],
      explain: [
        "A convenient way of finding the direction of the magnetic field associated with a current-carrying conductor is the right-hand thumb rule (Fig. 12.7).",
        "Imagine that you are holding a current-carrying straight conductor in your right hand such that the thumb points towards the direction of current. Then your fingers will wrap around the conductor in the direction of the field lines of the magnetic field.",
        "For a vertical wire with the current flowing upwards, the field lines go round anticlockwise when seen from above. When the current flows downwards, they go round clockwise."
      ],
      examples: [
        { n: "12.1", q: "A current through a horizontal power line flows in east to west direction. What is the direction of magnetic field at a point directly below it and at a point directly above it?",
          solution: ["The current is in the east–west direction.", "Applying the right-hand thumb rule (thumb pointing west), the direction of the magnetic field at a point directly below the wire is from north to south.", "The direction of the magnetic field at a point directly above the wire is from south to north."],
          answer: "Directly below the wire the field is from north to south; directly above it, from south to north.", setup: { mode: "powerline", dirP: 1 } }
      ],
      questions: [
        { tag: "In-text", q: "Draw magnetic field lines around a bar magnet.",
          a: "Draw smooth closed curves that come out of the north pole, go round outside the magnet and enter the south pole, with arrows pointing from N to S outside the magnet. Draw them close together near the poles, and never let two lines cross (Fig. 12.4).",
          topic: "field-lines", setup: { view: "lines" } },
        { tag: "In-text", q: "List the properties of magnetic field lines.",
          a: ["(i) Outside a magnet, field lines emerge from the north pole and merge at the south pole; inside the magnet they go from the south pole to the north pole. So they are closed curves.",
            "(ii) The direction of the field at a point is the direction in which the north pole of a compass needle placed there points (the tangent to the field line).",
            "(iii) The field is stronger where the field lines are crowded and weaker where they are far apart.",
            "(iv) No two field lines cross each other."],
          topic: "field-lines", setup: { view: "lines" } },
        { tag: "In-text", q: "Why don't two magnetic field lines intersect each other?",
          a: "If two field lines crossed, a compass needle placed at the point of intersection would have to point in two directions at the same time, which is not possible. So magnetic field lines never intersect." }
      ]
    },
    /* ---------------- 12.2.3 ---------------- */
    {
      id: "loop", num: "12.2.3", title: "Magnetic field due to a current through a circular loop", chip: "Circular loop",
      lead: "Activity 12.6 (Fig. 12.9): a coil passes through two holes in a cardboard. Look at the pattern near the centre of the coil, then increase the number of turns and the current.",
      sim: ["field", { modes: ["loop"], view: "filings", n: 1 }],
      explain: [
        "Suppose a straight wire is bent in the form of a circular loop and a current is passed through it.",
        "The magnetic field produced by a current-carrying straight wire depends inversely on the distance from it. So at every point of the loop, the concentric circles representing the field become larger and larger as we move away from the wire (Fig. 12.8).",
        "By the time we reach the centre of the circular loop, the arcs of these big circles appear as straight lines.",
        "By the right-hand rule, every section of the wire contributes to the magnetic field lines in the same direction within the loop.",
        "The magnetic field produced by a current-carrying wire at a given point depends directly on the current passing through it.",
        "If there is a circular coil having n turns, the field produced is n times as large as that produced by a single turn. This is because the current in each circular turn has the same direction, and the fields due to the turns just add up."
      ],
      formulas: [["Coil of n turns", "field = n × field of a single turn"], ["Field and current", "B ∝ I"]],
      activities: [
        { n: "12.6", title: "Field of a current-carrying coil",
          steps: [
            "Take a rectangular cardboard having two holes.",
            "Insert a circular coil having a large number of turns through them, normal to the plane of the cardboard.",
            "Connect the ends of the coil in series with a battery, a key and a rheostat (Fig. 12.9).",
            "Sprinkle iron filings uniformly on the cardboard.",
            "Plug the key and tap the cardboard gently a few times.",
            "Note the pattern of the iron filings that emerges on the cardboard."
          ],
          observe: "The iron filings form circles round each point where the coil passes through the cardboard. Near the centre of the coil the field lines are almost straight and parallel (Fig. 12.9).",
          setup: { view: "filings", on: true, n: 20 } }
      ]
    },
    /* ---------------- 12.2.4 ---------------- */
    {
      id: "solenoid", num: "12.2.4", title: "Magnetic field due to a current in a solenoid", chip: "Solenoid",
      lead: "Compare the field of a solenoid (Fig. 12.10) with that of a bar magnet. Put a soft iron core inside to make an electromagnet (Fig. 12.11), then switch the current off.",
      sim: ["field", { modes: ["solenoid", "magnet"], view: "lines" }],
      explain: [
        "A coil of many circular turns of insulated copper wire wrapped closely in the shape of a cylinder is called a solenoid.",
        "The pattern of the magnetic field lines around a current-carrying solenoid (Fig. 12.10) is similar to the field around a bar magnet (Fig. 12.4). One end of the solenoid behaves as a magnetic north pole, while the other behaves as the south pole.",
        "The field lines inside the solenoid are in the form of parallel straight lines. This indicates that the magnetic field is the same at all points inside the solenoid: the field is uniform inside the solenoid.",
        "A strong magnetic field produced inside a solenoid can be used to magnetise a piece of magnetic material, like soft iron, when placed inside the coil (Fig. 12.11). The magnet so formed is called an electromagnet.",
        "An electromagnet consists of a core of soft iron wrapped round with a coil of insulated copper wire. A soft iron core loses its magnetism when the current is switched off."
      ],
      formulas: [["Inside a long solenoid", "uniform field: parallel, equally spaced lines"], ["Ends of a solenoid", "behave like the N and S poles of a bar magnet"]],
      questions: [
        { tag: "In-text", q: "Consider a circular loop of wire lying in the plane of the table. Let the current pass through the loop clockwise. Apply the right-hand rule to find out the direction of the magnetic field inside and outside the loop.",
          a: "Inside the loop the magnetic field is perpendicular to the table, going into it (vertically downwards). Outside the loop the field comes out of the table (vertically upwards).",
          topic: "thumb-rule", setup: { mode: "loop", cw: true } },
        { tag: "In-text", q: "The magnetic field in a given region is uniform. Draw a diagram to represent it.",
          a: "Draw parallel straight lines, equally spaced, all with arrows pointing the same way, as inside a long current-carrying solenoid.",
          setup: { mode: "solenoid", view: "lines", on: true } },
        { tag: "In-text", q: "Choose the correct option. The magnetic field inside a long straight solenoid-carrying current",
          options: ["is zero.", "decreases as we move towards its end.", "increases as we move towards its end.", "is the same at all points."],
          a: "(d) is the same at all points. The field inside a long solenoid is uniform.", setup: { mode: "solenoid", view: "lines", on: true } },
        { tag: "Exercise 3 (a)", q: "True or false: the field at the centre of a long circular coil carrying current will be parallel straight lines.",
          a: "True. Inside a long coil (a solenoid) the field lines are parallel straight lines.", setup: { mode: "solenoid", view: "lines", on: true } },
        { tag: "Exercise 4", q: "List two methods of producing magnetic fields.",
          a: ["(i) By a permanent magnet, such as a bar magnet.", "(ii) By passing an electric current through a conductor, such as a straight wire, a circular coil or a solenoid. A solenoid with a soft iron core (an electromagnet) gives a strong field."],
          setup: { mode: "solenoid", view: "lines", on: true, core: true } }
      ]
    },
    /* ---------------- 12.3 ---------------- */
    {
      id: "force", num: "12.3", title: "Force on a current-carrying conductor in a magnetic field", chip: "Activity 12.7",
      lead: "Activity 12.7 (Fig. 12.12): the north pole is below and the south pole above the aluminium rod AB, so the field points upwards. Pass a current from B to A, then reverse the current or interchange the poles.",
      sim: ["force", {}],
      explain: [
        "An electric current flowing through a conductor produces a magnetic field, and this field exerts a force on a magnet placed near the conductor. The French scientist André Marie Ampère (1775–1836) suggested that the magnet must also exert an equal and opposite force on the current-carrying conductor.",
        "In Activity 12.7, when a current is passed through the aluminium rod from B to A, the rod is displaced towards the left. When the current is reversed, the rod is displaced towards the right.",
        "So a force is exerted on a current-carrying rod placed in a magnetic field, and the direction of the force is reversed when the direction of the current is reversed.",
        "When the direction of the field is changed to vertically downwards by interchanging the two poles of the magnet, the direction of the force is reversed again. The direction of the force depends on the direction of the current and the direction of the magnetic field.",
        "The displacement of the rod is largest (the force is the highest) when the direction of the current is at right angles to the direction of the magnetic field. The force is then perpendicular to both of them (Fleming's left-hand rule, next section).",
        "Devices that use current-carrying conductors and magnetic fields include the electric motor, electric generator, loudspeakers, microphones and measuring instruments."
      ],
      formulas: [["Direction of the force", "perpendicular to both the current and the field"], ["Force is largest", "when the current is at right angles to the field"], ["Reversing the current or the field", "reverses the force"]],
      activities: [
        { n: "12.7", title: "A current-carrying rod between the poles of a magnet",
          steps: [
            "Take a small aluminium rod AB (of about 5 cm). Using two connecting wires, suspend it horizontally from a stand (Fig. 12.12).",
            "Place a strong horse-shoe magnet so that the rod lies between the two poles with the magnetic field directed upwards: put the north pole of the magnet vertically below and the south pole vertically above the aluminium rod.",
            "Connect the aluminium rod in series with a battery, a key and a rheostat.",
            "Pass a current through the aluminium rod from end B to end A. What do you observe?",
            "Reverse the direction of the current flowing through the rod and observe the direction of its displacement.",
            "Change the direction of the field to vertically downwards by interchanging the two poles of the magnet, and observe again."
          ],
          observe: "With the current from B to A the rod is displaced towards the left. When the current is reversed, the rod is displaced towards the right. When the poles are interchanged, the direction of the force is reversed again. A force acts on the current-carrying rod, and its direction depends on the directions of the current and the magnetic field.",
          setup: { on: true, cur: 1, up: true } }
      ],
      boxes: [{ title: "More to know! Magnetism in medicine", text: [
        "An electric current always produces a magnetic field. Even weak ion currents that travel along the nerve cells in our body produce magnetic fields. When we touch something, our nerves carry an electric impulse to the muscles we need to use. This impulse produces a temporary magnetic field.",
        "These fields are very weak, about one-billionth of the earth's magnetic field. Two main organs in the human body where the magnetic field produced is significant are the heart and the brain.",
        "The magnetic field inside the body forms the basis of obtaining images of different body parts. This is done using a technique called Magnetic Resonance Imaging (MRI). Analysis of these images helps in medical diagnosis. Magnetism has, thus, got important uses in medicine."
      ] }],
      questions: [
        { tag: "In-text", q: "Which of the following property of a proton can change while it moves freely in a magnetic field? (There may be more than one correct answer.)",
          options: ["mass", "speed", "velocity", "momentum"],
          a: "(c) velocity and (d) momentum. The magnetic force on the proton is always at right angles to its motion, so it changes the direction of the velocity (and so the momentum), but not the speed or the mass." },
        { tag: "In-text", q: "In Activity 12.7, how do we think the displacement of rod AB will be affected if (i) current in rod AB is increased; (ii) a stronger horse-shoe magnet is used; and (iii) length of the rod AB is increased?",
          a: "In each case the force on the rod increases, so the displacement of rod AB increases: (i) increases, (ii) increases, (iii) increases.",
          setup: { on: true, I: 5, strong: true, long: true } },
        { tag: "In-text", q: "A positively-charged particle (alpha-particle) projected towards west is deflected towards north by a magnetic field. The direction of magnetic field is",
          options: ["towards south", "towards east", "downward", "upward"],
          a: "(d) upward. For a positive charge the current is in the direction of motion (west). With the middle finger pointing west and the thumb pointing north (force), the forefinger points upwards.",
          topic: "flhr", setup: { frame: "compass", find: "field", carrier: "positive", m: "west", f: "north" } }
      ]
    },
    /* ---------------- 12.3: the rule ---------------- */
    {
      id: "flhr", num: "12.3", title: "Fleming's left-hand rule", chip: "Fleming's rule",
      lead: "Fig. 12.13. Choose the directions of the field and of the current (or a moving charge) to find the force, or give the force to find the field. The buttons set up the NCERT cases.",
      sim: ["flhr", {}],
      explain: [
        "When the current and the magnetic field are perpendicular to each other, the force on the conductor is perpendicular to both of them.",
        "Fleming's left-hand rule: stretch the thumb, forefinger and middle finger of your left hand such that they are mutually perpendicular (Fig. 12.13). If the first finger points in the direction of the magnetic field and the second finger in the direction of the current, then the thumb will point in the direction of motion or the force acting on the conductor.",
        "The direction of current is taken opposite to the direction of motion of electrons, because electrons are negatively charged. For a positive charge, such as a proton or an alpha particle, the current is in the direction of its motion.",
        "The force is largest when the current is at right angles to the field. It becomes smaller as the angle between them decreases, and it is zero when the current is along the field.",
        "The force on a moving charge is always at right angles to its motion. It changes the direction of the velocity (and momentum) but not the speed."
      ],
      formulas: [["Fleming's left-hand rule", "Forefinger → field, middle finger → current, thumb → force (motion)"], ["Moving electron", "current is opposite to its motion"]],
      examples: [
        { n: "12.2", q: "An electron enters a magnetic field at right angles to it, as shown in Fig. 12.14 (the electron moves downwards and the magnetic field is from left to right). The direction of force acting on the electron will be (a) to the right. (b) to the left. (c) out of the page. (d) into the page.",
          solution: ["The direction of the force is perpendicular to the direction of the magnetic field and the current, as given by Fleming's left-hand rule.", "Recall that the direction of current is taken opposite to the direction of motion of electrons. The electron moves downwards, so the current is upwards.", "First finger towards the right (field), second finger upwards (current): the thumb points into the page."],
          answer: "(d) into the page.", setup: { frame: "page", find: "force", carrier: "electron", b: "right", m: "bottom", angle: 90 } }
      ],
      questions: [
        { tag: "Exercise 5", q: "When is the force experienced by a current-carrying conductor placed in a magnetic field largest?",
          a: "When the direction of the current is at right angles (perpendicular) to the direction of the magnetic field. The force becomes smaller as the angle decreases, and is zero when the current is along the field.",
          setup: { frame: "page", find: "force", carrier: "current", b: "top", m: "right", angle: 90 } },
        { tag: "Exercise 6", q: "Imagine that you are sitting in a chamber with your back to one wall. An electron beam, moving horizontally from back wall towards the front wall, is deflected by a strong magnetic field to your right side. What is the direction of magnetic field?",
          a: "Vertically downwards. The electrons move towards the front wall, so the current is towards the back wall. With the middle finger pointing towards the back wall (current) and the thumb to the right (force), the forefinger points vertically downwards.",
          setup: { frame: "room", find: "field", carrier: "electron", m: "front", f: "right" } },
        { tag: "Exercise 7", q: "State the rule to determine the direction of a (i) magnetic field produced around a straight conductor-carrying current, (ii) force experienced by a current-carrying straight conductor placed in a magnetic field which is perpendicular to it, and (iii) current induced in a coil due to its rotation in a magnetic field.",
          a: ["(i) The right-hand thumb rule.", "(ii) Fleming's left-hand rule.",
            "(iii) Fleming's right-hand rule: stretch the thumb, forefinger and middle finger of the right hand so that they are mutually perpendicular. If the forefinger points in the direction of the magnetic field and the thumb in the direction of motion of the conductor, the middle finger gives the direction of the induced current. (Induced currents are not explained in the current NCERT chapter.)"] }
      ]
    },
    /* ---------------- 12.4 ---------------- */
    {
      id: "domestic", num: "12.4", title: "Domestic electric circuits", chip: "Domestic circuits",
      lead: "A house wiring diagram like Fig. 12.15. Switch appliances on and off (click them), raise the supply voltage or make a short circuit to see the fuse act. Then look at earthing and at the AC supply.",
      sim: ["domestic", { mode: "circuits" }],
      explain: [
        "In our homes we receive the supply of electric power through a main supply (also called mains), either supported through overhead electric poles or by underground cables.",
        "One of the wires in this supply, usually with red insulation cover, is called the live wire (or positive). Another wire, with black insulation, is called the neutral wire (or negative). In our country, the potential difference between the two is 220 V.",
        "At the meter-board in the house, these wires pass into an electricity meter through a main fuse. Through the main switch they are connected to the line wires in the house, which supply electricity to separate circuits within the house.",
        "Often two separate circuits are used: one of 15 A current rating for appliances with higher power ratings, such as geysers and air coolers, and the other of 5 A current rating for bulbs, fans, etc.",
        "The earth wire, which has insulation of green colour, is usually connected to a metal plate deep in the earth near the house. It is a safety measure, especially for appliances that have a metallic body, for example an electric press, toaster, table fan or refrigerator.",
        "The metallic body is connected to the earth wire, which provides a low-resistance conducting path for the current. This ensures that any leakage of current to the metallic body keeps its potential equal to that of the earth, and the user may not get a severe electric shock.",
        "In each separate circuit, different appliances can be connected across the live and neutral wires. Each appliance has a separate switch to turn it ON or OFF. So that each appliance has an equal potential difference, they are connected parallel to each other.",
        "The electric fuse is an important component of all domestic circuits. A fuse prevents damage to the appliances and the circuit due to overloading. The Joule heating that takes place in the fuse melts it and breaks the circuit.",
        "Overloading can occur when the live wire and the neutral wire come into direct contact (when the insulation of the wires is damaged or there is a fault in an appliance). The current in the circuit then abruptly increases. This is called short-circuiting.",
        "Overloading can also occur due to an accidental hike in the supply voltage, and sometimes by connecting too many appliances to a single socket.",
        "In our houses we receive AC electric power of 220 V with a frequency of 50 Hz. The direction of an alternating current reverses every 1/100 s, while a direct current (from a cell or battery) always flows in one direction."
      ],
      formulas: [["Current drawn by an appliance", "I = P / V"], ["Appliances in parallel", "total current I = I₁ + I₂ + …"], ["Mains supply in India", "AC, 220 V, 50 Hz"]],
      questions: [
        { tag: "In-text", q: "Name two safety measures commonly used in electric circuits and appliances.",
          a: "(i) The electric fuse, which melts and breaks the circuit when the current becomes too large (overloading or short-circuiting). (ii) Earthing of appliances with a metallic body, so that any leakage current goes to the earth and the user does not get a severe shock.",
          setup: { mode: "earthing", reset: true, fault: true, earth: true, touch: true } },
        { tag: "In-text", q: "An electric oven of 2 kW power rating is operated in a domestic electric circuit (220 V) that has a current rating of 5 A. What result do you expect? Explain.",
          a: "The oven draws a current I = P/V = 2000 W ÷ 220 V ≈ 9.1 A, which is much more than the 5 A rating of the circuit. The circuit is overloaded: the fuse wire heats up and melts, and the circuit is broken. (Without a fuse, the wires could overheat and cause a fire.)",
          setup: { mode: "circuits", reset: true, volts: 220, on: { oven: true } } },
        { tag: "In-text", q: "What precaution should be taken to avoid the overloading of domestic electric circuits?",
          a: "Do not connect too many appliances to a single socket, and do not switch on too many high-power appliances on the same circuit at the same time. Use the 15 A circuit for high-power appliances, use a fuse of the correct rating, and do not use appliances or wires with damaged insulation." },
        { tag: "Exercise 2", q: "At the time of short circuit, the current in the circuit",
          options: ["reduces substantially.", "does not change.", "increases heavily.", "vary continuously."],
          a: "(c) increases heavily.", setup: { mode: "circuits", reset: true, volts: 220, short: 5 } },
        { tag: "Exercise 3 (b)", q: "True or false: a wire with a green insulation is usually the live wire of an electric supply.",
          a: "False. The wire with green insulation is the earth wire. The live wire usually has red insulation, and the neutral wire black." },
        { tag: "Exercise 8", q: "When does an electric short circuit occur?",
          a: "When the live wire and the neutral wire come into direct contact, for example when the insulation of the wires is damaged or there is a fault in an appliance. The resistance of the circuit then becomes very small and the current increases abruptly.",
          setup: { mode: "circuits", reset: true, volts: 220, short: 15 } },
        { tag: "Exercise 9", q: "What is the function of an earth wire? Why is it necessary to earth metallic appliances?",
          a: ["The earth wire provides a low-resistance conducting path from the metallic body of an appliance to a metal plate deep in the earth.", "If, due to a fault, the live wire touches the metallic body, the leakage current flows to the earth and the body stays at the earth's potential, so a person touching it does not get a severe electric shock. The large current also blows the fuse and cuts off the supply."],
          setup: { mode: "earthing", reset: true, fault: true, earth: true, touch: true } }
      ]
    }
  ],
  exercises: [
    { n: 1, q: "Which of the following correctly describes the magnetic field near a long straight wire?",
      options: ["The field consists of straight lines perpendicular to the wire.", "The field consists of straight lines parallel to the wire.", "The field consists of radial lines originating from the wire.", "The field consists of concentric circles centred on the wire."],
      a: "(d) The field consists of concentric circles centred on the wire.", go: { topic: "straight-wire", setup: { view: "filings", on: true } } },
    { n: 2, q: "At the time of short circuit, the current in the circuit",
      options: ["reduces substantially.", "does not change.", "increases heavily.", "vary continuously."],
      a: "(c) increases heavily. The live and neutral wires touch, so the resistance of the circuit becomes very small.", go: { topic: "domestic", setup: { mode: "circuits", reset: true, volts: 220, short: 5 } } },
    { n: 3, q: "State whether the following statements are true or false. (a) The field at the centre of a long circular coil carrying current will be parallel straight lines. (b) A wire with a green insulation is usually the live wire of an electric supply.",
      a: ["(a) True.", "(b) False. A wire with green insulation is the earth wire; the live wire usually has red insulation."], go: { topic: "solenoid", setup: { mode: "solenoid", view: "lines", on: true } } },
    { n: 4, q: "List two methods of producing magnetic fields.",
      a: ["(i) By a permanent magnet, such as a bar magnet.", "(ii) By passing an electric current through a conductor, such as a straight wire, a circular coil or a solenoid. A solenoid with a soft iron core (an electromagnet) gives a strong field."],
      go: { topic: "solenoid", setup: { mode: "solenoid", view: "lines", on: true, core: true } } },
    { n: 5, q: "When is the force experienced by a current-carrying conductor placed in a magnetic field largest?",
      a: "When the direction of the current is at right angles (perpendicular) to the direction of the magnetic field.", go: { topic: "flhr", setup: { frame: "page", find: "force", carrier: "current", b: "top", m: "right", angle: 90 } } },
    { n: 6, q: "Imagine that you are sitting in a chamber with your back to one wall. An electron beam, moving horizontally from back wall towards the front wall, is deflected by a strong magnetic field to your right side. What is the direction of magnetic field?",
      a: "Vertically downwards. The electrons move towards the front wall, so the current is towards the back wall. By Fleming's left-hand rule, with the middle finger towards the back wall (current) and the thumb to the right (force), the forefinger points downwards.",
      go: { topic: "flhr", setup: { frame: "room", find: "field", carrier: "electron", m: "front", f: "right" } } },
    { n: 7, q: "State the rule to determine the direction of a (i) magnetic field produced around a straight conductor-carrying current, (ii) force experienced by a current-carrying straight conductor placed in a magnetic field which is perpendicular to it, and (iii) current induced in a coil due to its rotation in a magnetic field.",
      a: ["(i) The right-hand thumb rule.", "(ii) Fleming's left-hand rule.", "(iii) Fleming's right-hand rule: with the thumb, forefinger and middle finger of the right hand mutually perpendicular, if the forefinger points along the field and the thumb along the motion of the conductor, the middle finger gives the direction of the induced current."],
      go: { topic: "thumb-rule", setup: { mode: "vertical" } } },
    { n: 8, q: "When does an electric short circuit occur?",
      a: "When the live wire and the neutral wire come into direct contact, for example when the insulation of the wires is damaged or there is a fault in an appliance. The current in the circuit then increases abruptly.",
      go: { topic: "domestic", setup: { mode: "circuits", reset: true, volts: 220, short: 15 } } },
    { n: 9, q: "What is the function of an earth wire? Why is it necessary to earth metallic appliances?",
      a: ["The earth wire provides a low-resistance conducting path from the metallic body of an appliance to the earth (a metal plate buried deep near the house).", "If the live wire touches the metallic body because of a fault, the leakage current goes to the earth and the body stays at the earth's potential, so the user does not get a severe electric shock. The large current also melts the fuse and cuts off the supply."],
      go: { topic: "domestic", setup: { mode: "earthing", reset: true, fault: true, earth: true, touch: true } } }
  ],
  summary: [
    "A compass needle is a small magnet. Its one end, which points towards north, is called a north pole, and the other end, which points towards south, is called a south pole.",
    "A magnetic field exists in the region surrounding a magnet, in which the force of the magnet can be detected.",
    "Field lines are used to represent a magnetic field. A field line is the path along which a hypothetical free north pole would tend to move. The direction of the magnetic field at a point is given by the direction that a north pole placed at that point would take. Field lines are shown closer together where the magnetic field is greater.",
    "A metallic wire carrying an electric current has associated with it a magnetic field. The field lines about the wire consist of a series of concentric circles whose direction is given by the right-hand rule.",
    "The pattern of the magnetic field around a conductor due to an electric current flowing through it depends on the shape of the conductor. The magnetic field of a solenoid carrying a current is similar to that of a bar magnet.",
    "An electromagnet consists of a core of soft iron wrapped around with a coil of insulated copper wire.",
    "A current-carrying conductor when placed in a magnetic field experiences a force. If the direction of the field and that of the current are mutually perpendicular to each other, then the force acting on the conductor will be perpendicular to both and will be given by Fleming's left-hand rule.",
    "In our houses we receive AC electric power of 220 V with a frequency of 50 Hz. One of the wires in this supply is with red insulation, called live wire. The other one is of black insulation, which is a neutral wire. The potential difference between the two is 220 V. The third is the earth wire that has green insulation and this is connected to a metallic body deep inside earth. It is used as a safety measure to ensure that any leakage of current to a metallic body does not give any severe shock to a user.",
    "Fuse is the most important safety device, used for protecting the circuits due to short-circuiting or overloading of the circuits."
  ]
});
