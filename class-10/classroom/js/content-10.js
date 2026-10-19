/* ============================================================
   Chapter 10 — The Human Eye and the Colourful World (NCERT, rationalised)
   ============================================================ */
"use strict";
CR.chapters.push({
  id: "eye", num: 10, short: "Human Eye", title: "The Human Eye and the Colourful World", notes: "../human-eye.html",
  topics: [
    /* ---------------- 10.1 ---------------- */
    {
      id: "human-eye", num: "10.1", title: "The human eye", chip: "Human eye",
      lead: "The parts of the eye and what each one does. Switch between bright and dim light to see the pupil change, and move the object to see its image form on the retina.",
      sim: ["eyeParts", { u: Infinity, labels: true }],
      explain: [
        "The human eye is one of the most valuable and sensitive sense organs. It enables us to see the wonderful world and the colours around us.",
        "The human eye is like a camera. Its lens system forms an image on a light-sensitive screen called the retina.",
        "Light enters the eye through a thin membrane called the cornea. It forms the transparent bulge on the front surface of the eyeball. The eyeball is approximately spherical, with a diameter of about 2.3 cm.",
        "Most of the refraction of the light entering the eye occurs at the outer surface of the cornea. The crystalline lens (eye lens) only provides the finer adjustment of focal length needed to focus objects at different distances on the retina.",
        "Behind the cornea is the iris, a dark muscular diaphragm that controls the size of the pupil. The pupil regulates and controls the amount of light entering the eye.",
        "The eye lens forms an inverted real image of the object on the retina.",
        "The retina is a delicate membrane with an enormous number of light-sensitive cells. They are activated by light and generate electrical signals, which are sent to the brain through the optic nerves. The brain interprets these signals, so that we perceive objects as they are."
      ],
      formulas: [["Diameter of the eyeball", "about 2.3 cm"]],
      questions: [
        { tag: "Exercise 2", q: "The human eye forms the image of an object at its", options: ["cornea.", "iris.", "pupil.", "retina."], a: "(d) Retina. The eye lens forms a real, inverted image on the retina.", setup: { u: 200 } }
      ]
    },
    /* ---------------- 10.1.1 ---------------- */
    {
      id: "accommodation", num: "10.1.1", title: "Power of accommodation", chip: "Accommodation",
      lead: "Bring the object from far away to 25 cm, and then closer. Watch the ciliary muscles and the thickness of the eye lens.",
      sim: ["eyeParts", { u: 50, labels: false }],
      explain: [
        "The eye lens is composed of a fibrous, jelly-like material. Its curvature can be changed to some extent by the ciliary muscles, and this changes its focal length.",
        "When the ciliary muscles are relaxed, the lens becomes thin and its focal length increases. This enables us to see distant objects clearly.",
        "When we look at objects closer to the eye, the ciliary muscles contract. This increases the curvature of the eye lens, which becomes thicker, and its focal length decreases. This enables us to see nearby objects clearly.",
        "The ability of the eye lens to adjust its focal length is called accommodation.",
        "The focal length of the eye lens cannot be decreased below a certain minimum. A printed page held very close to the eyes looks blurred, or strains the eye. To see an object comfortably and distinctly, we hold it about 25 cm from the eyes.",
        "The minimum distance at which objects can be seen most distinctly without strain is called the least distance of distinct vision, or the near point of the eye. For a young adult with normal vision, the near point is about 25 cm.",
        "The farthest point up to which the eye can see objects clearly is the far point of the eye. It is infinity for a normal eye. So a normal eye can see objects clearly that are between 25 cm and infinity.",
        "Sometimes the crystalline lens of people in old age becomes milky and cloudy. This condition is called cataract. It causes partial or complete loss of vision, and vision can be restored through cataract surgery."
      ],
      formulas: [["Near point of a normal eye (least distance of distinct vision)", "about 25 cm"], ["Far point of a normal eye", "infinity"]],
      questions: [
        { tag: "In-text", q: "What is meant by power of accommodation of the eye?", a: "The ability of the eye lens to adjust its focal length is called accommodation. The ciliary muscles change the curvature of the eye lens, so that both nearby and distant objects are focused on the retina.", setup: { u: 25 } },
        { tag: "In-text", q: "What is the far point and near point of the human eye with normal vision?", a: "For a normal eye the far point is at infinity and the near point is about 25 cm from the eye.", setup: { u: 25 } },
        { tag: "Exercise 1", q: "The human eye can focus on objects at different distances by adjusting the focal length of the eye lens. This is due to", options: ["presbyopia.", "accommodation.", "near-sightedness.", "far-sightedness."], a: "(b) Accommodation.", setup: { u: 50 } },
        { tag: "Exercise 3", q: "The least distance of distinct vision for a young adult with normal vision is about", options: ["25 m.", "2.5 cm.", "25 cm.", "2.5 m."], a: "(c) 25 cm.", setup: { u: 25 } },
        { tag: "Exercise 4", q: "The change in focal length of an eye lens is caused by the action of the", options: ["pupil.", "retina.", "ciliary muscles.", "iris."], a: "(c) Ciliary muscles. They change the curvature of the eye lens.", setup: { u: 25 } },
        { tag: "Exercise 8", q: "Why is a normal eye not able to see clearly the objects placed closer than 25 cm?", a: "The focal length of the eye lens cannot be decreased below a certain minimum: the ciliary muscles cannot make the eye lens any more curved. So an object closer than 25 cm (the near point) cannot be focused on the retina; it looks blurred and strains the eye.", setup: { u: 15 } },
        { tag: "Exercise 9", q: "What happens to the image distance in the eye when we increase the distance of an object from the eye?", a: "The image distance stays the same: the image is always formed on the retina, and the distance between the eye lens and the retina does not change. Instead, the ciliary muscles relax, the eye lens becomes thinner and its focal length increases.", setup: { u: 200 } }
      ]
    },
    /* ---------------- 10.2 ---------------- */
    {
      id: "defects", num: "10.2", title: "Defects of vision and their correction", chip: "Defects of vision",
      lead: "Choose an eye and what it looks at, then put on the spectacles. Below the diagram, enter a far point or a near point to work out the power of the lens needed.",
      sim: ["eye", { cond: "myopia", obj: "far", fix: "off" }],
      explain: [
        "Sometimes the eye may gradually lose its power of accommodation. The person then cannot see objects distinctly and comfortably: vision becomes blurred because of refractive defects of the eye.",
        "There are mainly three common refractive defects of vision: (i) myopia or near-sightedness, (ii) hypermetropia or far-sightedness, and (iii) presbyopia. They can be corrected by suitable spherical lenses.",
        "Myopia: a person can see nearby objects clearly but cannot see distant objects distinctly. The far point is nearer than infinity; the person may see clearly only up to a few metres.",
        "In a myopic eye, the image of a distant object is formed in front of the retina. It may arise from (i) excessive curvature of the eye lens, or (ii) elongation of the eyeball. A concave lens of suitable power brings the image back onto the retina.",
        "Hypermetropia: a person can see distant objects clearly but cannot see nearby objects distinctly. The near point is farther away than the normal near point (25 cm), so reading material has to be kept much beyond 25 cm.",
        "In a hypermetropic eye, light rays from a nearby object are focused at a point behind the retina. It arises because (i) the focal length of the eye lens is too long, or (ii) the eyeball has become too small. A convex lens of appropriate power provides the additional focusing power needed to form the image on the retina.",
        "Presbyopia: the power of accommodation usually decreases with ageing. The near point gradually recedes, and nearby objects cannot be seen comfortably without corrective glasses. It arises from the gradual weakening of the ciliary muscles and the diminishing flexibility of the eye lens.",
        "Sometimes a person suffers from both myopia and hypermetropia and needs bifocal lenses. A common bifocal lens has a concave upper portion, for distant vision, and a convex lower part, for near vision.",
        "These days refractive defects can also be corrected with contact lenses or through surgical interventions."
      ],
      formulas: [["Lens for myopia", "concave; f = −(distance of the far point)"], ["Lens for hypermetropia", "convex; it makes an object at 25 cm appear at the near point"], ["Power of a lens", "P = 1/f  (f in metres)"]],
      boxes: [{ title: "Think it over: eye donation (NCERT)", items: [
        "Our eyes can live even after our death. By donating our eyes after we die, we can light the life of a blind person.",
        "Eye donors can belong to any age group or sex. People who use spectacles, or who have been operated for cataract, can still donate their eyes. So can people who are diabetic, have hypertension or asthma, and those without communicable diseases.",
        "Eyes must be removed within 4–6 hours after death, so the nearest eye bank should be informed immediately. The eye bank team removes the eyes at home or at a hospital; it takes only 10–15 minutes and does not lead to any disfigurement.",
        "Persons who were infected with or died because of AIDS, Hepatitis B or C, rabies, acute leukaemia, tetanus, cholera, meningitis or encephalitis cannot donate eyes.",
        "An eye bank collects, evaluates and distributes the donated eyes. The identity of the donor and of the recipient remains confidential. One pair of eyes gives vision to up to four corneal blind people."] }],
      questions: [
        { tag: "In-text", q: "A person with a myopic eye cannot see objects beyond 1.2 m distinctly. What should be the type of the corrective lens used to restore proper vision?", a: "A concave (diverging) lens. Its focal length should be −1.2 m (power −0.83 D), so that it makes distant objects appear to be at the far point of the eye, 1.2 m away.", setup: { cond: "myopia", obj: "far", fix: "on", far: 120 } },
        { tag: "In-text", q: "A student has difficulty reading the blackboard while sitting in the last row. What could be the defect the child is suffering from? How can it be corrected?", a: "Myopia (near-sightedness): the student cannot see distant objects clearly. It is corrected by using spectacles with a concave lens of suitable power.", setup: { cond: "myopia", obj: "far", fix: "on" } },
        { tag: "Exercise 5", q: "A person needs a lens of power −5.5 dioptres for correcting his distant vision. For correcting his near vision he needs a lens of power +1.5 dioptre. What is the focal length of the lens required for correcting (i) distant vision, and (ii) near vision?", a: ["(i) Distant vision: f = 1/P = 1/(−5.5 D) = −0.182 m = −18.2 cm (a concave lens).", "(ii) Near vision: f = 1/P = 1/(+1.5 D) = +0.667 m = +66.7 cm (a convex lens)."], setup: { cond: "bifocal", obj: "far", fix: "on" } },
        { tag: "Exercise 6", q: "The far point of a myopic person is 80 cm in front of the eye. What is the nature and power of the lens required to correct the problem?", a: ["A concave lens, which forms the image of a distant object at the far point: u = −∞, v = −80 cm.", "1/f = 1/v − 1/u = −1/80, so f = −80 cm = −0.8 m.", "P = 1/f = 1/(−0.8 m) = −1.25 D."], setup: { cond: "myopia", obj: "far", fix: "on", far: 80 } },
        { tag: "Exercise 7", q: "Make a diagram to show how hypermetropia is corrected. The near point of a hypermetropic eye is 1 m. What is the power of the lens required to correct this defect? Assume that the near point of the normal eye is 25 cm.", a: ["A convex lens makes the rays from an object at 25 cm seem to come from the near point of the eye (see the simulation for the diagram).", "u = −25 cm, v = −100 cm. 1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100, so f = +33.3 cm = +0.333 m.", "P = 1/f = +3.0 D."], setup: { cond: "hyper", obj: "near", fix: "on", near: 100 } }
      ]
    },
    /* ---------------- 10.3 ---------------- */
    {
      id: "prism", num: "10.3", title: "Refraction of light through a prism", chip: "Prism",
      lead: "Activity 10.1 with pins P, Q, R and S. Change the angle of incidence and read ∠i, ∠r, ∠e and the angle of deviation ∠D.",
      sim: ["prism", { mode: "act", i: 48 }],
      explain: [
        "In a rectangular glass slab the refracting surfaces are parallel, so the emergent ray is parallel to the incident ray, though slightly displaced laterally.",
        "A triangular glass prism has two triangular bases and three rectangular lateral surfaces. These surfaces are inclined to each other. The angle between its two lateral faces is called the angle of the prism.",
        "At the first surface AB the ray goes from air into glass and bends towards the normal. At the second surface AC it goes from glass into air and bends away from the normal.",
        "The peculiar shape of the prism makes the emergent ray bend at an angle to the direction of the incident ray. This angle is called the angle of deviation (∠D)."
      ],
      activities: [
        { n: "10.1", title: "Refraction of light through a triangular glass prism",
          steps: ["Fix a sheet of white paper on a drawing board using drawing pins.", "Place a glass prism on it so that it rests on its triangular base. Trace the outline of the prism with a pencil.", "Draw a straight line PE inclined to one of the refracting surfaces, say AB, of the prism.", "Fix two pins, at points P and Q, on the line PE.", "Look for the images of the pins at P and Q through the other face AC.", "Fix two more pins at points R and S, such that the pins at R and S and the images of P and Q lie on the same straight line.", "Remove the pins and the prism. PE meets the boundary of the prism at E; join and produce R and S to meet the boundary at F. Join E and F.", "Draw perpendiculars to the refracting surfaces AB and AC at E and F. Mark the angle of incidence ∠i, the angle of refraction ∠r and the angle of emergence ∠e."],
          observe: "PE is the incident ray, EF the refracted ray and FS the emergent ray. At AB (air to glass) the ray bends towards the normal; at AC (glass to air) it bends away from the normal. Unlike in a glass slab, the emergent ray is bent at an angle to the incident ray: this is the angle of deviation ∠D, which can be marked and measured.",
          setup: { mode: "act", i: 45 } }
      ]
    },
    /* ---------------- 10.4 ---------------- */
    {
      id: "dispersion", num: "10.4", title: "Dispersion of white light by a glass prism", chip: "Dispersion",
      lead: "Activity 10.2: a narrow beam of white light through a prism gives a spectrum. Then try Newton's second prism, and a raindrop.",
      sim: ["prism", { mode: "disp", i: 48 }],
      explain: [
        "When a narrow beam of white light passes through a glass prism, it splits into a band of colours: violet, indigo, blue, green, yellow, orange and red. The acronym VIBGYOR helps to remember the sequence.",
        "The band of the coloured components of a light beam is called its spectrum. The splitting of light into its component colours is called dispersion.",
        "Different colours of light bend through different angles with respect to the incident ray as they pass through a prism. Red light bends the least and violet the most. So the rays of each colour emerge along different paths and become distinct.",
        "Isaac Newton was the first to use a glass prism to obtain the spectrum of sunlight. He tried to split the colours further with another similar prism, but could not get any more colours.",
        "Newton then placed a second, identical prism in an inverted position with respect to the first. All the colours passed through it, and a beam of white light emerged from the other side. This showed that sunlight is made up of seven colours. Any light that gives a spectrum similar to that of sunlight is often called white light.",
        "A rainbow is a natural spectrum appearing in the sky after a rain shower. It is caused by dispersion of sunlight by tiny water droplets in the atmosphere, and always forms in the direction opposite to the Sun.",
        "The water droplets act like small prisms. They refract and disperse the incident sunlight, then reflect it internally, and finally refract it again when it comes out of the raindrop. A rainbow can also be seen on a sunny day through a waterfall or a fountain, with the Sun behind you."
      ],
      formulas: [["Colours of the spectrum", "V I B G Y O R"], ["Bending of colours in a prism", "red least, violet most"]],
      activities: [
        { n: "10.2", title: "Dispersion of white light",
          steps: ["Take a thick sheet of cardboard and make a small hole or narrow slit in its middle.", "Allow sunlight to fall on the narrow slit. This gives a narrow beam of white light.", "Take a glass prism and allow the light from the slit to fall on one of its faces.", "Turn the prism slowly until the light that comes out of it appears on a nearby screen."],
          observe: "A beautiful band of colours appears on the screen, in the order violet, indigo, blue, green, yellow, orange and red (VIBGYOR). The prism has split the white light into its component colours. This is dispersion, and the band is a spectrum.",
          setup: { mode: "disp", i: 48 } }
      ]
    },
    /* ---------------- 10.5 ---------------- */
    {
      id: "atmospheric", num: "10.5", title: "Atmospheric refraction", chip: "Atmospheric refraction",
      lead: "Watch a star twinkle while a planet stays steady. Then see why the Sun is visible before sunrise and after sunset, and why things waver above a fire.",
      sim: ["atmos", { mode: "twinkle" }],
      explain: [
        "Objects seen through a turbulent stream of hot air rising above a fire or a radiator appear to waver or flicker. The air just above the fire is hotter, lighter (less dense) and has a slightly lower refractive index than the cooler air above it.",
        "Since the physical conditions of this air are not stationary, the apparent position of an object seen through it fluctuates. This is atmospheric refraction (refraction of light by the Earth's atmosphere) on a small scale.",
        "The twinkling of a star is due to atmospheric refraction of starlight. Starlight entering the Earth's atmosphere is refracted continuously, in a medium of gradually changing refractive index, before it reaches the Earth.",
        "The atmosphere bends starlight towards the normal, so the apparent position of a star is slightly different from its actual position. A star seen near the horizon appears slightly higher than its actual position.",
        "This apparent position keeps changing slightly, because the conditions of the atmosphere are not stationary. Stars are very distant, point-sized sources, so the amount of starlight entering the eye flickers: the star sometimes appears brighter and sometimes fainter. This is twinkling.",
        "Planets are much closer to the Earth and are seen as extended sources, like a collection of a large number of point-sized sources. The variations in the light from all of them average out to zero, so planets do not twinkle.",
        "Advance sunrise and delayed sunset: because of atmospheric refraction, the Sun is visible about 2 minutes before the actual sunrise and about 2 minutes after the actual sunset. (The actual sunrise is the actual crossing of the horizon by the Sun.)",
        "The apparent flattening of the Sun's disc at sunrise and sunset is also due to atmospheric refraction."
      ],
      formulas: [["Advance sunrise and delayed sunset", "about 2 minutes each"]],
      questions: [
        { tag: "Exercise 10", q: "Why do stars twinkle?", a: "Twinkling is due to atmospheric refraction of starlight. Starlight is refracted continuously as it passes through the atmosphere, whose refractive index changes gradually and whose conditions keep changing. So the apparent position of the star fluctuates and, since a star is a point-sized source, the amount of light entering the eye flickers: the star seems to twinkle.", setup: { mode: "twinkle", where: "low", air: "moving" } },
        { tag: "Exercise 11", q: "Explain why the planets do not twinkle.", a: "Planets are much closer to the Earth and are seen as extended sources. A planet acts like a collection of a large number of point-sized sources; the variations in the light from all of them average out to zero, so there is no twinkling.", setup: { mode: "twinkle", where: "low", air: "moving" } }
      ]
    },
    /* ---------------- 10.6, 10.6.1 ---------------- */
    {
      id: "tyndall", num: "10.6, 10.6.1", title: "Scattering of light: the Tyndall effect", chip: "Tyndall effect",
      lead: "A fine beam of sunlight enters a dark room through a small hole. Turn the smoke on and off. Then change the size of the scattering particles.",
      sim: ["scatter", { mode: "tyndall" }],
      explain: [
        "The interplay of light with objects around us gives rise to several spectacular phenomena, such as the blue colour of the sky and the colour of water in the deep sea.",
        "In Class IX: the path of a beam of light through a true solution is not visible, but it becomes visible through a colloidal solution, where the particles are relatively larger.",
        "The Earth's atmosphere is a heterogeneous mixture of minute particles: smoke, tiny water droplets, suspended particles of dust and molecules of air.",
        "When a beam of light strikes such fine particles, the path of the beam becomes visible. The light reaches us after being reflected diffusely by these particles. This scattering of light by colloidal particles gives rise to the Tyndall effect.",
        "The Tyndall effect is seen when a fine beam of sunlight enters a smoke-filled room through a small hole, and when sunlight passes through the canopy of a dense forest, where tiny water droplets in the mist scatter light.",
        "The colour of the scattered light depends on the size of the scattering particles. Very fine particles scatter mainly blue light, while larger particles scatter light of longer wavelengths. If the particles are large enough, the scattered light may even appear white."
      ]
    },
    /* ---------------- 10.6.2 ---------------- */
    {
      id: "blue-sky", num: "10.6.2", title: "Why is the colour of the clear sky blue?", chip: "Blue sky",
      lead: "Compare the sky with and without air. Then see why danger signal lights are red.",
      sim: ["scatter", { mode: "sky" }],
      explain: [
        "The molecules of air and other fine particles in the atmosphere are smaller than the wavelength of visible light.",
        "They are more effective in scattering light of shorter wavelengths, at the blue end, than light of longer wavelengths, at the red end. Red light has a wavelength about 1.8 times that of blue light.",
        "So when sunlight passes through the atmosphere, the fine particles in air scatter blue light more strongly than red. The scattered blue light enters our eyes, and the clear sky looks blue.",
        "If the Earth had no atmosphere there would be no scattering, and the sky would look dark. The sky appears dark to passengers flying at very high altitudes, as scattering is not prominent at such heights.",
        "'Danger' signal lights are red because red light is scattered the least by fog or smoke. So it can be seen in the same colour from a distance."
      ],
      formulas: [["Scattering by very fine particles", "blue (short wavelength) more than red"], ["Wavelength of red light", "about 1.8 times that of blue light"]],
      questions: [
        { tag: "Exercise 12", q: "Why does the sky appear dark instead of blue to an astronaut?", a: "At such heights there is no atmosphere (no air molecules or fine particles) to scatter sunlight. With no scattered light reaching the astronaut's eyes, the sky appears dark.", setup: { mode: "sky", air: false } },
        { tag: "From the text", q: "Why are 'danger' signal lights red in colour?", a: "Red light is scattered the least by fog or smoke, so it can be seen in the same colour from a distance.", setup: { mode: "signal", fog: 0.6 } }
      ]
    }
  ],
  exercises: [
    { n: 1, q: "The human eye can focus on objects at different distances by adjusting the focal length of the eye lens. This is due to", options: ["presbyopia.", "accommodation.", "near-sightedness.", "far-sightedness."], a: "(b) Accommodation.", go: { topic: "accommodation", setup: { u: 50 } } },
    { n: 2, q: "The human eye forms the image of an object at its", options: ["cornea.", "iris.", "pupil.", "retina."], a: "(d) Retina.", go: { topic: "human-eye", setup: { u: 200 } } },
    { n: 3, q: "The least distance of distinct vision for a young adult with normal vision is about", options: ["25 m.", "2.5 cm.", "25 cm.", "2.5 m."], a: "(c) 25 cm.", go: { topic: "accommodation", setup: { u: 25 } } },
    { n: 4, q: "The change in focal length of an eye lens is caused by the action of the", options: ["pupil.", "retina.", "ciliary muscles.", "iris."], a: "(c) Ciliary muscles.", go: { topic: "accommodation", setup: { u: 25 } } },
    { n: 5, q: "A person needs a lens of power −5.5 dioptres for correcting his distant vision. For correcting his near vision he needs a lens of power +1.5 dioptre. What is the focal length of the lens required for correcting (i) distant vision, and (ii) near vision?", a: ["(i) f = 1/P = 1/(−5.5 D) = −0.182 m = −18.2 cm: a concave lens.", "(ii) f = 1/P = 1/(+1.5 D) = +0.667 m = +66.7 cm: a convex lens."], go: { topic: "defects", setup: { cond: "bifocal", obj: "far", fix: "on" } } },
    { n: 6, q: "The far point of a myopic person is 80 cm in front of the eye. What is the nature and power of the lens required to correct the problem?", a: ["A concave lens that forms the image of distant objects at the far point: u = −∞, v = −80 cm, so f = −80 cm = −0.8 m.", "P = 1/f = −1.25 D."], go: { topic: "defects", setup: { cond: "myopia", obj: "far", fix: "on", far: 80 } } },
    { n: 7, q: "Make a diagram to show how hypermetropia is corrected. The near point of a hypermetropic eye is 1 m. What is the power of the lens required to correct this defect? Assume that the near point of the normal eye is 25 cm.", a: ["A convex lens makes the rays from an object at 25 cm seem to come from the near point, 1 m away (diagram: see the simulation).", "u = −25 cm, v = −100 cm. 1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100, so f = +33.3 cm = +0.333 m.", "P = 1/f = +3.0 D."], go: { topic: "defects", setup: { cond: "hyper", obj: "near", fix: "on", near: 100 } } },
    { n: 8, q: "Why is a normal eye not able to see clearly the objects placed closer than 25 cm?", a: "The focal length of the eye lens cannot be decreased below a certain minimum, because the ciliary muscles cannot increase the curvature of the eye lens beyond a limit. So objects closer than the near point (25 cm) cannot be focused on the retina.", go: { topic: "accommodation", setup: { u: 15 } } },
    { n: 9, q: "What happens to the image distance in the eye when we increase the distance of an object from the eye?", a: "Nothing: the image distance stays the same, because the image is always formed on the retina. The eye lens becomes thinner (its focal length increases) by accommodation.", go: { topic: "accommodation", setup: { u: 200 } } },
    { n: 10, q: "Why do stars twinkle?", a: "Because of atmospheric refraction of starlight. The atmosphere's refractive index changes gradually and its conditions keep changing, so the apparent position of a star fluctuates and the amount of light from this point-sized source entering the eye flickers.", go: { topic: "atmospheric", setup: { mode: "twinkle", where: "low", air: "moving" } } },
    { n: 11, q: "Explain why the planets do not twinkle.", a: "Planets are much closer and are seen as extended sources, a collection of many point-sized sources. The variations in the light from all of them average out to zero.", go: { topic: "atmospheric", setup: { mode: "twinkle", where: "low", air: "moving" } } },
    { n: 12, q: "Why does the sky appear dark instead of blue to an astronaut?", a: "In space there is no atmosphere to scatter sunlight, so no scattered light reaches the astronaut's eyes and the sky looks dark.", go: { topic: "blue-sky", setup: { mode: "sky", air: false } } }
  ],
  summary: [
    "The ability of the eye to focus on both near and distant objects, by adjusting its focal length, is called the accommodation of the eye.",
    "The smallest distance, at which the eye can see objects clearly without strain, is called the near point of the eye or the least distance of distinct vision. For a young adult with normal vision, it is about 25 cm.",
    "The common refractive defects of vision include myopia, hypermetropia and presbyopia. Myopia (short-sightedness – the image of distant objects is focussed before the retina) is corrected by using a concave lens of suitable power. Hypermetropia (far-sightedness – the image of nearby objects is focussed beyond the retina) is corrected by using a convex lens of suitable power. The eye loses its power of accommodation at old age.",
    "The splitting of white light into its component colours is called dispersion.",
    "Scattering of light causes the blue colour of sky."
  ]
});
