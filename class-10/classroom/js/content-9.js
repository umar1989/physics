/* ============================================================
   Chapter 9 — Light: Reflection and Refraction (NCERT, rationalised)
   ============================================================ */
"use strict";
CR.chapters.push({
  id: "light", num: 9, short: "Light", title: "Light – Reflection and Refraction", notes: "../light-reflection-refraction.html",
  topics: [
    /* ---------------- 9.1 ---------------- */
    {
      id: "reflection", num: "9.1", title: "Reflection of light", chip: "Reflection",
      lead: "The laws of reflection, and the image formed by a plane mirror. Switch to “Image in a plane mirror” to see lateral inversion.",
      sim: ["reflection", { mode: "laws" }],
      explain: [
        "Light seems to travel in straight lines. A highly polished surface, such as a mirror, reflects most of the light falling on it.",
        "First law of reflection: the angle of incidence is equal to the angle of reflection.",
        "Second law of reflection: the incident ray, the normal to the mirror at the point of incidence and the reflected ray all lie in the same plane.",
        "These laws are valid for all types of reflecting surfaces, including spherical surfaces.",
        "The image formed by a plane mirror is always virtual and erect.",
        "The size of the image is equal to that of the object, and the image is as far behind the mirror as the object is in front of it.",
        "The image is laterally inverted: left and right are interchanged."
      ],
      formulas: [["Laws of reflection", "∠i = ∠r"], ["Plane mirror", "image distance = object distance, m = +1"]],
      activities: [
        { n: "9.1", title: "Images in a shining spoon",
          steps: ["Take a large shining spoon and try to view your face in its curved surface. Do you get the image? Is it smaller or larger?", "Move the spoon slowly away from your face. Observe the image. How does it change?", "Reverse the spoon and repeat. How does the image look now?", "Compare the characteristics of the image on the two surfaces."],
          observe: "The curved surface of a shining spoon can be considered as a curved mirror (section 9.2). The inner surface, curved in, acts as a concave mirror: close to the face the image is erect and enlarged, and as the spoon moves away it becomes inverted. The outer surface, bulging out, acts as a convex mirror: the image is always erect and smaller.",
          topic: "concave-mirror", setup: { type: "concave", F: 10, U: 5 } }
      ],
      questions: [
        { tag: "Exercise 13", q: "The magnification produced by a plane mirror is +1. What does this mean?", a: "m = +1 means the image is the same size as the object (|m| = 1) and erect (m is positive). Such an image is virtual.", setup: { mode: "plane", d: 20 } },
        { tag: "Exercise 5", q: "No matter how far you stand from a mirror, your image appears erect. The mirror is likely to be", options: ["only plane.", "only concave.", "only convex.", "either plane or convex."], a: "(d) Either plane or convex. Both always form erect (virtual) images. A concave mirror forms an inverted image when you stand beyond its focus." }
      ]
    },
    /* ---------------- 9.2 ---------------- */
    {
      id: "spherical-mirrors", num: "9.2", title: "Spherical mirrors", chip: "Spherical mirrors",
      lead: "Turn on “Names of points” to label the pole, centre of curvature, principal focus, focal length, radius of curvature and aperture. Parallel rays show the principal focus.",
      sim: ["optics", { kind: "mirror", type: "concave", inf: true, labels: true, F: 12 }],
      explain: [
        "A spherical mirror is a mirror whose reflecting surface is part of a hollow sphere of glass.",
        "Concave mirror: its reflecting surface is curved inwards, that is, it faces towards the centre of the sphere. Convex mirror: its reflecting surface is curved outwards.",
        "Pole (P): the centre of the reflecting surface of a spherical mirror.",
        "Centre of curvature (C): the centre of the sphere of which the reflecting surface is a part. It is not part of the mirror. It lies in front of a concave mirror and behind a convex mirror.",
        "Radius of curvature (R): the radius of that sphere. Principal axis: the straight line through the pole and the centre of curvature. It is normal to the mirror at its pole.",
        "Principal focus (F) of a concave mirror: rays parallel to the principal axis meet at this point on the axis after reflection. For a convex mirror, the reflected rays appear to come from a point F behind the mirror.",
        "Focal length (f): the distance between the pole and the principal focus. Aperture: the diameter of the reflecting surface.",
        "For spherical mirrors of small aperture, the radius of curvature is twice the focal length: R = 2f. So the principal focus lies midway between the pole and the centre of curvature."
      ],
      formulas: [["Radius of curvature and focal length", "R = 2f"]],
      activities: [
        { n: "9.2", title: "Finding the principal focus with sunlight", caution: "Do not look at the Sun directly, or even into a mirror reflecting sunlight. It may damage your eyes.",
          steps: ["Hold a concave mirror and direct its reflecting surface towards the Sun.", "Direct the reflected light onto a sheet of paper held close to the mirror.", "Move the paper back and forth until you get a bright, sharp spot of light.", "Hold the mirror and the paper in the same position for a few minutes."],
          observe: "The paper begins to burn. The mirror converges the parallel rays of sunlight to a point, its principal focus. The bright spot is the image of the Sun, and the concentrated light heats the paper. The distance of the spot from the mirror gives the approximate focal length.",
          setup: { type: "concave", inf: true } }
      ],
      questions: [
        { tag: "In-text", q: "Define the principal focus of a concave mirror.", a: "Rays of light parallel to the principal axis of a concave mirror, after reflection, meet at a point on the principal axis. This point is called the principal focus of the concave mirror.", setup: { type: "concave", inf: true } },
        { tag: "In-text", q: "The radius of curvature of a spherical mirror is 20 cm. What is its focal length?", a: "f = R/2 = 20 cm / 2 = 10 cm.", setup: { type: "concave", F: 10, inf: true } }
      ]
    },
    /* ---------------- 9.2.2 rules ---------------- */
    {
      id: "mirror-rays", num: "9.2.2", title: "Ray diagrams for spherical mirrors: the four rules", chip: "Ray rules",
      lead: "Use the “Show” buttons to show one ray at a time, for a concave and then a convex mirror. Any two rays are enough to locate the image.",
      sim: ["optics", { kind: "mirror", type: "concave", U: 25, F: 10, rays: { r1: true, r2: false, r3: false, r4: false } }],
      explain: [
        "To locate the image of a point, consider at least two rays from it. The image is where the reflected rays meet (real image) or appear to meet (virtual image).",
        "Rule 1: A ray parallel to the principal axis, after reflection, passes through the principal focus of a concave mirror, or appears to diverge from the principal focus of a convex mirror.",
        "Rule 2: A ray passing through the principal focus of a concave mirror, or a ray directed towards the principal focus of a convex mirror, after reflection, emerges parallel to the principal axis.",
        "Rule 3: A ray passing through the centre of curvature of a concave mirror, or directed towards the centre of curvature of a convex mirror, after reflection, is reflected back along the same path.",
        "Rule 4: A ray incident obliquely at the pole P of a concave or a convex mirror is reflected obliquely. The incident and reflected rays make equal angles with the principal axis.",
        "In every case the laws of reflection are followed at the point of incidence."
      ],
      activities: [
        { n: "9.4", title: "Drawing the ray diagrams",
          steps: ["Draw neat ray diagrams for each position of the object shown in Table 9.1.", "You may take any two of the rays listed in the rules to locate the image.", "Compare your diagrams with the NCERT figure (Fig. 9.7)."],
          observe: "Each diagram gives the image position, size and nature listed in Table 9.1. Use “Place object” on the next page to check each case.",
          setup: { rays: { r1: true, r2: true, r3: false, r4: false } } }
      ],
      questions: [
        { tag: "Rule 1", q: "Show Rule 1 for a convex mirror.", a: "The ray parallel to the principal axis is reflected so that it appears to come from the principal focus F behind the mirror (dashed line).", setup: { type: "convex", U: 20, rays: { r1: true, r2: false, r3: false, r4: false } } },
        { tag: "Rule 2", q: "Show Rule 2 for a concave mirror.", a: "The ray through F comes out parallel to the principal axis after reflection.", setup: { type: "concave", U: 25, rays: { r1: false, r2: true, r3: false, r4: false } } },
        { tag: "Rule 3", q: "Show Rule 3 for a concave mirror.", a: "The ray through the centre of curvature C falls normally on the mirror and is reflected back along the same path.", setup: { type: "concave", U: 25, rays: { r1: false, r2: false, r3: true, r4: false } } },
        { tag: "Rule 4", q: "Show Rule 4 for a convex mirror.", a: "The ray falling on the pole P is reflected so that the incident and reflected rays make equal angles with the principal axis.", setup: { type: "convex", U: 20, rays: { r1: false, r2: false, r3: false, r4: true } } }
      ]
    },
    /* ---------------- 9.2.2 (a) concave ---------------- */
    {
      id: "concave-mirror", num: "9.2.1, 9.2.2 (a)", title: "Image formation by a concave mirror", chip: "Concave mirror",
      lead: "Place the object at each position in Table 9.1, including “At infinity”. The matching row of the table is highlighted. (Table 9.1 and Activity 9.3 are in section 9.2.1; the ray diagrams, Fig. 9.7, are in 9.2.2 (a).)",
      sim: ["optics", { kind: "mirror", type: "concave", U: 25, F: 10 }],
      explain: [
        "The nature, position and size of the image formed by a concave mirror depend on the position of the object relative to P, F and C (Table 9.1).",
        "Object at infinity: image at F, highly diminished (point-sized), real and inverted.",
        "Object beyond C: image between F and C, diminished, real and inverted.",
        "Object at C: image at C, same size, real and inverted.",
        "Object between C and F: image beyond C, enlarged, real and inverted.",
        "Object at F: image at infinity, highly enlarged, real and inverted.",
        "Object between P and F: image behind the mirror, enlarged, virtual and erect. This is the only position that gives a virtual image.",
        "A real image can be obtained on a screen; a virtual image cannot."
      ],
      boxes: [{ title: "Uses of concave mirrors (NCERT)", items: [
        "In torches, search-lights and vehicle headlights, to get powerful parallel beams of light.",
        "As shaving mirrors, to see a larger image of the face.",
        "By dentists, to see large images of the teeth of patients.",
        "Large concave mirrors concentrate sunlight to produce heat in solar furnaces."] }],
      activities: [
        { n: "9.3", title: "Images formed by a concave mirror on a screen",
          steps: ["Find the approximate focal length of a concave mirror as in Activity 9.2 (the bright spot is the image of the Sun). Note the value.", "Mark a line on a table with chalk and place the mirror on a stand with its pole over the line. Draw two more parallel lines, one focal length apart, for F and C.", "Keep a burning candle far beyond C. Move a paper screen in front of the mirror until you get a sharp image of the flame. Note its nature, position and relative size.", "Repeat with the candle (a) just beyond C, (b) at C, (c) between F and C, (d) at F and (e) between P and F. In one case you may not get the image on the screen; then look for the image in the mirror itself. Tabulate your observations."],
          observe: "The results match Table 9.1. A real, inverted image is obtained on the screen for every position beyond F. With the candle at F the image is at infinity. Between P and F no image forms on the screen: the image is virtual, erect and enlarged, seen in the mirror.",
          setup: { type: "concave", U: 26 } }
      ],
      questions: [
        { tag: "In-text", q: "Name a mirror that can give an erect and enlarged image of an object.", a: "A concave mirror, when the object is placed between its pole P and principal focus F.", setup: { type: "concave", F: 10, U: 5 } },
        { tag: "Exercise 7", q: "We wish to obtain an erect image of an object, using a concave mirror of focal length 15 cm. What should be the range of distance of the object from the mirror? What is the nature of the image? Is the image larger or smaller than the object?", a: "The object must be between the pole and the principal focus, that is, less than 15 cm from the mirror. The image is virtual and erect, and larger than the object.", setup: { type: "concave", F: 15, U: 10 } }
      ]
    },
    /* ---------------- 9.2.2 (b) convex ---------------- */
    {
      id: "convex-mirror", num: "9.2.2 (b)", title: "Image formation by a convex mirror", chip: "Convex mirror",
      lead: "A convex mirror has only two cases in Table 9.2. Move the object and watch the image stay virtual, erect and diminished, between P and F.",
      sim: ["optics", { kind: "mirror", type: "convex", U: 20, F: 10 }],
      explain: [
        "Object at infinity: image at the focus F, behind the mirror, highly diminished (point-sized), virtual and erect.",
        "Object anywhere between infinity and the pole P: image between P and F, behind the mirror, diminished, virtual and erect.",
        "As the object moves away from the mirror, the image becomes smaller and moves towards F."
      ],
      boxes: [{ title: "Uses of convex mirrors (NCERT)", items: [
        "Convex mirrors are commonly used as rear-view (wing) mirrors in vehicles, fitted on the sides so the driver can see the traffic behind.",
        "They are preferred because they always give an erect, though diminished, image.",
        "They have a wider field of view as they are curved outwards, so the driver can view a much larger area than with a plane mirror."] }],
      activities: [
        { n: "9.5", title: "A pencil in front of a convex mirror",
          steps: ["Hold a convex mirror in one hand and a pencil upright in the other.", "Observe the image: is it erect or inverted, diminished or enlarged?", "Move the pencil slowly away from the mirror. Does the image become smaller or larger?", "Does the image move closer to or farther away from the focus as the pencil moves away?"],
          observe: "The image is always erect and diminished. As the pencil moves away, the image becomes smaller and moves closer to the focus F behind the mirror.",
          setup: { type: "convex", U: 8 } },
        { n: "9.6", title: "Full-length image of a distant object",
          steps: ["Look at the image of a distant tall object, such as a tree, in plane mirrors of different sizes.", "Repeat with a concave mirror.", "Now try a convex mirror. Explain your observations."],
          observe: "A convex mirror shows the full-length image of the tall object easily, because it always forms an erect, diminished image and has a wide field of view. A plane mirror shows the whole object only if it is large enough, and a concave mirror gives an inverted image of a distant object.",
          setup: { type: "convex", U: 90 } }
      ],
      questions: [
        { tag: "In-text", q: "Why do we prefer a convex mirror as a rear-view mirror in vehicles?", a: "A convex mirror always gives an erect, though diminished, image. It also has a wider field of view because it is curved outwards, so the driver can see a much larger area of the traffic behind.", setup: { type: "convex", U: 60 } },
        { tag: "Exercise 12", q: "An object is placed at a distance of 10 cm from a convex mirror of focal length 15 cm. Find the position and nature of the image.", a: ["u = −10 cm, f = +15 cm. 1/v = 1/f − 1/u = 1/15 + 1/10 = 5/30 = 1/6, so v = +6 cm.", "The image is 6 cm behind the mirror. m = −v/u = +0.6, so it is virtual, erect and diminished."], setup: { type: "convex", F: 15, U: 10 } }
      ]
    },
    /* ---------------- 9.2.3 sign convention ---------------- */
    {
      id: "mirror-sign", num: "9.2.3", title: "Sign convention for reflection by spherical mirrors", chip: "Sign convention",
      lead: "The New Cartesian Sign Convention. The arrows show which directions are positive; u and v are drawn with their signs.",
      sim: ["optics", { kind: "mirror", type: "concave", U: 25, F: 10, sign: true }],
      explain: [
        "The pole P of the mirror is taken as the origin, and the principal axis as the x-axis.",
        "The object is always placed to the left of the mirror, so light from the object falls on the mirror from the left.",
        "All distances parallel to the principal axis are measured from the pole of the mirror.",
        "Distances measured to the right of the origin (along +x) are positive; distances measured to the left (along −x) are negative.",
        "Distances measured perpendicular to and above the principal axis (along +y) are positive; those below the axis (along −y) are negative.",
        "So the object distance u is always negative. f is negative for a concave mirror and positive for a convex mirror.",
        "A real image forms in front of the mirror, so its v is negative; a virtual image forms behind, so its v is positive.",
        "An erect image has positive height h′, and an inverted image negative h′."
      ],
      questions: [
        { tag: "Exercise 4", q: "A spherical mirror and a thin spherical lens have each a focal length of −15 cm. The mirror and the lens are likely to be", options: ["both concave.", "both convex.", "the mirror is concave and the lens is convex.", "the mirror is convex, but the lens is concave."], a: "(a) Both concave. By the sign convention the focal length is negative for a concave mirror and for a concave lens." }
      ]
    },
    /* ---------------- 9.2.4 mirror formula ---------------- */
    {
      id: "mirror-formula", num: "9.2.4", title: "Mirror formula and magnification", chip: "Mirror formula",
      lead: "Every position you choose is worked out with the mirror formula below the diagram. Enter the object height to get the image height.",
      sim: ["optics", { kind: "mirror", type: "concave", U: 25, F: 15, h: 4 }],
      explain: [
        "Object distance u: distance of the object from the pole. Image distance v: distance of the image from the pole. Focal length f: distance of the principal focus from the pole.",
        "Mirror formula: 1/v + 1/u = 1/f. It is valid for all spherical mirrors and all positions of the object.",
        "Use the New Cartesian Sign Convention when substituting numbers.",
        "Magnification m is the ratio of the height of the image to the height of the object: m = h′/h. It is also m = −v/u.",
        "Negative m: the image is real and inverted. Positive m: the image is virtual and erect.",
        "|m| > 1: the image is enlarged; |m| < 1: it is diminished; |m| = 1: same size."
      ],
      formulas: [["Mirror formula", "1/v + 1/u = 1/f"], ["Magnification", "m = h′/h = −v/u"]],
      examples: [
        { n: "9.1", q: "A convex mirror used for rear-view on an automobile has a radius of curvature of 3.00 m. If a bus is located at 5.00 m from this mirror, find the position, nature and size of the image.",
          solution: ["R = +3.00 m, so f = R/2 = +1.50 m. u = −5.00 m.", "1/v = 1/f − 1/u = 1/1.50 + 1/5.00 = (5.00 + 1.50)/7.50", "v = 7.50/6.50 = +1.15 m.", "m = −v/u = −1.15/(−5.00) = +0.23.", "The simulation shows this at one-tenth scale (f = 15 cm, u = 50 cm); the magnification stays the same."],
          answer: "The image is 1.15 m behind the mirror. It is virtual, erect and 0.23 times the size of the bus.",
          setup: { type: "convex", F: 15, U: 50, h: 5 } },
        { n: "9.2", q: "An object, 4.0 cm in size, is placed at 25.0 cm in front of a concave mirror of focal length 15.0 cm. At what distance from the mirror should a screen be placed in order to obtain a sharp image? Find the nature and the size of the image.",
          solution: ["h = +4.0 cm, u = −25.0 cm, f = −15.0 cm.", "1/v = 1/f − 1/u = −1/15.0 + 1/25.0 = (−5.0 + 3.0)/75.0 = −2.0/75.0", "v = −37.5 cm: the screen is placed 37.5 cm in front of the mirror.", "m = h′/h = −v/u, so h′ = −v h/u = −(−37.5 cm)(4.0 cm)/(−25.0 cm) = −6.0 cm."],
          answer: "Screen at 37.5 cm in front of the mirror. The image is real, inverted and enlarged, 6.0 cm tall.",
          setup: { type: "concave", F: 15, U: 25, h: 4 } }
      ],
      questions: [
        { tag: "In-text", q: "Find the focal length of a convex mirror whose radius of curvature is 32 cm.", a: "R = +32 cm for a convex mirror, so f = R/2 = +16 cm.", setup: { type: "convex", F: 16, U: 30 } },
        { tag: "In-text", q: "A concave mirror produces three times magnified (enlarged) real image of an object placed at 10 cm in front of it. Where is the image located?", a: ["A real image is inverted, so m = −3. u = −10 cm.", "m = −v/u, so v = −m u = −(−3)(−10 cm) = −30 cm.", "The image is 30 cm in front of the mirror. (The focal length works out to 7.5 cm.)"], setup: { type: "concave", F: 7.5, U: 10 } },
        { tag: "Exercise 14", q: "An object 5.0 cm in length is placed at a distance of 20 cm in front of a convex mirror of radius of curvature 30 cm. Find the position of the image, its nature and size.", a: ["f = R/2 = +15 cm, u = −20 cm. 1/v = 1/f − 1/u = 1/15 + 1/20 = 7/60, so v = +8.57 cm (behind the mirror).", "m = −v/u = 8.57/20 = +0.43, so h′ = m × h = 0.43 × 5.0 cm = +2.14 cm.", "The image is virtual, erect and diminished."], setup: { type: "convex", F: 15, U: 20, h: 5 } },
        { tag: "Exercise 15", q: "An object of size 7.0 cm is placed at 27 cm in front of a concave mirror of focal length 18 cm. At what distance from the mirror should a screen be placed, so that a sharp focussed image can be obtained? Find the size and the nature of the image.", a: ["u = −27 cm, f = −18 cm. 1/v = −1/18 + 1/27 = −1/54, so v = −54 cm: the screen goes 54 cm in front of the mirror.", "m = −v/u = −2, so h′ = −2 × 7.0 = −14 cm.", "The image is real, inverted and enlarged."], setup: { type: "concave", F: 18, U: 27, h: 7 } }
      ]
    },
    /* ---------------- 9.3 refraction ---------------- */
    {
      id: "refraction", num: "9.3", title: "Refraction of light", chip: "Refraction",
      lead: "Activity 9.8: the coin is hidden behind the edge of the bowl. Pour water slowly and watch the coin come into view.",
      sim: ["refraction", { mode: "coin", level: 0 }],
      explain: [
        "The bottom of a tank or pond containing water appears to be raised. Letters under a thick glass slab appear raised when seen from the top.",
        "A pencil partly immersed in water appears to be displaced at the interface of air and water. A lemon in a glass of water looks bigger than it is when seen from the side.",
        "This happens because light reaching us from the part under water comes from a different direction compared with the part above water.",
        "The extent of the effect is different for different pairs of media (for example water, kerosene or turpentine).",
        "When light travels obliquely from one medium to another, its direction of propagation changes in the second medium. This is called refraction of light."
      ],
      activities: [
        { n: "9.7", title: "Picking up a coin from a bucket of water",
          steps: ["Place a coin at the bottom of a bucket filled with water.", "With your eye to one side above the water, try to pick up the coin in one go.", "Repeat, and compare your experience with your friends."],
          observe: "Most people miss the coin at the first try. Light from the coin bends as it leaves the water, so the coin appears raised: it is deeper than it looks.",
          setup: { mode: "coin", level: 80 } },
        { n: "9.8", title: "The coin that reappears",
          steps: ["Put a coin in a large shallow bowl on a table.", "Move away slowly until the coin just disappears from sight behind the edge of the bowl.", "Ask a friend to pour water gently into the bowl without disturbing the coin.", "Keep looking from the same position."],
          observe: "The coin becomes visible again. Light from the coin bends away from the normal at the water surface and reaches the eye over the edge of the bowl.",
          setup: { mode: "coin", level: 0 } },
        { n: "9.9", title: "A line seen through a glass slab",
          steps: ["Draw a thick straight ink line on white paper. Place a glass slab over it so that one edge makes an angle with the line.", "Look at the part of the line under the slab from the sides. Does it appear bent at the edges?", "Place the slab so that it is normal to the line, and look again.", "Look at the line from the top of the slab. Does it appear raised?"],
          observe: "With the slab at an angle, the line appears bent (shifted) at the edges of the slab. With the slab normal to the line, it does not appear bent. From the top, the part under the slab appears raised. All these are effects of refraction." }
      ]
    },
    /* ---------------- 9.3.1 glass slab ---------------- */
    {
      id: "glass-slab", num: "9.3.1", title: "Refraction through a rectangular glass slab", chip: "Glass slab",
      lead: "Activity 9.10 with pins: the ray bends towards the normal entering the glass and away from the normal leaving it. Change the angle and the material.",
      sim: ["refraction", { mode: "slab", i: 40 }],
      explain: [
        "When a ray enters the slab obliquely from air (rarer) into glass (denser), it bends towards the normal.",
        "When it leaves the slab, going from glass (denser) into air (rarer), it bends away from the normal.",
        "The bending at the two parallel faces is equal and opposite, so the emergent ray is parallel to the incident ray. It is only shifted sideways (lateral displacement).",
        "A ray falling along the normal (angle of incidence 0°) goes straight through without bending.",
        "First law of refraction: the incident ray, the refracted ray and the normal at the point of incidence all lie in the same plane.",
        "Second law (Snell's law): for light of a given colour and a given pair of media, sin i / sin r is a constant. This constant is the refractive index of the second medium with respect to the first."
      ],
      formulas: [["Snell's law", "sin i / sin r = constant = n₂₁"]],
      activities: [
        { n: "9.10", title: "Tracing a ray through a glass slab",
          steps: ["Fix white paper on a drawing board and place a rectangular glass slab on it. Draw its outline ABCD.", "Fix two pins E and F so that the line EF is inclined to the edge AB.", "Look through the opposite edge CD and fix pins G and H in line with the images of E and F.", "Remove the slab and pins. Join EF and produce it to meet AB at O; join HG and produce it to meet CD at O′. Join OO′. Produce EF as a dotted line."],
          observe: "At O (air to glass) the ray bends towards the normal; at O′ (glass to air) it bends away from the normal. The emergent ray GH is parallel to the incident ray EF but shifted sideways.",
          setup: { mode: "slab", i: 40 } }
      ]
    },
    /* ---------------- 9.3.2 refractive index ---------------- */
    {
      id: "refractive-index", num: "9.3.2", title: "The refractive index", chip: "Refractive index",
      lead: "Choose any two media from NCERT Table 9.3. The table below highlights the media you choose.",
      sim: ["refraction", { mode: "interface", n1: 1.0003, n2: 1.33, i: 40 }],
      explain: [
        "Light changes direction when it goes from one medium to another because its speed is different in different media.",
        "Light travels fastest in vacuum, with a speed of 3 × 10⁸ m/s. In air it is only slightly less; in glass or water it is much less.",
        "The refractive index of medium 2 with respect to medium 1 is n₂₁ = (speed of light in medium 1)/(speed of light in medium 2) = v₁/v₂. Similarly n₁₂ = v₂/v₁.",
        "If medium 1 is vacuum (or air), the refractive index of medium 2 is its absolute refractive index: n = c/v.",
        "A medium with a larger refractive index is optically denser. Light travels slower in it, and a ray entering it obliquely bends towards the normal.",
        "Optical density is not the same as mass density. Kerosene has a higher refractive index than water, so it is optically denser, although its mass density is less than water."
      ],
      formulas: [["Relative refractive index", "n₂₁ = v₁ / v₂"], ["Absolute refractive index", "n = c / v"], ["Speed of light in vacuum", "c = 3 × 10⁸ m/s"]],
      questions: [
        { tag: "In-text", q: "A ray of light travelling in air enters obliquely into water. Does the light ray bend towards the normal or away from the normal? Why?", a: "It bends towards the normal, because water is optically denser than air: light slows down when it enters water.", setup: { mode: "interface", n1: 1.0003, n2: 1.33, i: 40 } },
        { tag: "In-text", q: "Light enters from air to glass having refractive index 1.50. What is the speed of light in the glass? The speed of light in vacuum is 3 × 10⁸ m/s.", a: "v = c/n = (3 × 10⁸ m/s)/1.50 = 2 × 10⁸ m/s." },
        { tag: "In-text", q: "Find out, from Table 9.3, the medium having highest optical density. Also find the medium with lowest optical density.", a: "Highest optical density: diamond (refractive index 2.42). Lowest: air (1.0003)." },
        { tag: "In-text", q: "You are given kerosene, turpentine and water. In which of these does the light travel fastest? Use the information given in Table 9.3.", a: "In water. Its refractive index (1.33) is the lowest of the three (kerosene 1.44, turpentine oil 1.47), and the speed of light is v = c/n.", setup: { mode: "interface", n1: 1.0003, n2: 1.33, i: 45 } },
        { tag: "In-text", q: "The refractive index of diamond is 2.42. What is the meaning of this statement?", a: "The speed of light in diamond is 1/2.42 times its speed in vacuum: light travels 2.42 times faster in vacuum than in diamond (n = c/v).", setup: { mode: "interface", n1: 1.0003, n2: 2.42, i: 45 } }
      ]
    },
    /* ---------------- 9.3.3 lenses ---------------- */
    {
      id: "lenses", num: "9.3.3", title: "Refraction by spherical lenses", chip: "Lenses",
      lead: "Parallel rays from the Sun meet at the principal focus of a convex lens and spread out from a concave lens. Turn on “Names of points” to label the parts.",
      sim: ["optics", { kind: "lens", type: "convex", inf: true, labels: true, F: 12 }],
      explain: [
        "A transparent material bound by two surfaces, of which one or both are spherical, forms a lens.",
        "A lens with two spherical surfaces bulging outwards is a double convex lens, simply called a convex lens. It is thicker at the middle than at the edges and converges light rays, so it is called a converging lens.",
        "A double concave lens is bounded by two spherical surfaces curved inwards. It is thicker at the edges than at the middle and diverges light rays, so it is called a diverging lens.",
        "Each surface is part of a sphere; the centres of these spheres are the centres of curvature of the lens (C₁ and C₂). The principal axis is the imaginary line through the two centres of curvature.",
        "The central point of a lens is its optical centre O. A ray of light through the optical centre passes without any deviation. The effective diameter of the lens is its aperture.",
        "Principal focus of a convex lens: rays parallel to the principal axis converge to a point on the axis after refraction. For a concave lens they appear to diverge from a point on the axis. A lens has two principal foci, F₁ and F₂, one on each side.",
        "Focal length f: the distance of the principal focus from the optical centre."
      ],
      activities: [
        { n: "9.11", title: "Burning paper with a convex lens", caution: "Do not look at the Sun directly or through a lens. You may damage your eyes.",
          steps: ["Hold a convex lens and direct it towards the Sun.", "Focus the sunlight on a sheet of paper to get a sharp, bright image of the Sun.", "Hold the paper and the lens in the same position for a while and keep watching the paper."],
          observe: "The paper begins to burn. The convex lens converges the sunlight to its principal focus; the bright spot is the image of the Sun, and the heat there burns the paper.",
          setup: { type: "convex", inf: true } }
      ],
      questions: [
        { tag: "Exercise 1", q: "Which one of the following materials cannot be used to make a lens?", options: ["Water", "Glass", "Plastic", "Clay"], a: "(d) Clay. A lens must be transparent so that light can pass through it; clay is opaque." }
      ]
    },
    /* ---------------- 9.3.5 lens rules ---------------- */
    {
      id: "lens-rays", num: "9.3.5", title: "Ray diagrams for lenses: the three rules", chip: "Lens ray rules",
      lead: "Show one ray at a time with the “Show” buttons, for a convex and then a concave lens.",
      sim: ["optics", { kind: "lens", type: "convex", U: 25, F: 10, rays: { r1: true, r2: false, r3: false } }],
      explain: [
        "Rule 1: A ray parallel to the principal axis, after refraction from a convex lens, passes through the principal focus on the other side of the lens. For a concave lens, it appears to diverge from the principal focus on the same side of the lens.",
        "Rule 2: A ray passing through a principal focus of a convex lens, after refraction, emerges parallel to the principal axis. A ray directed towards the principal focus of a concave lens, after refraction, also emerges parallel to the principal axis.",
        "Rule 3: A ray passing through the optical centre of a lens emerges without any deviation.",
        "Any two of these rays locate the image of the top of the object."
      ],
      questions: [
        { tag: "Rule 1", q: "Show Rule 1 for a concave lens.", a: "The ray parallel to the principal axis spreads out after refraction, as if it came from the focus F₁ on the same side as the object (dashed line).", setup: { type: "concave", U: 20, rays: { r1: true, r2: false, r3: false } } },
        { tag: "Rule 2", q: "Show Rule 2 for a convex lens.", a: "The ray through F₁ comes out parallel to the principal axis.", setup: { type: "convex", U: 25, rays: { r1: false, r2: true, r3: false } } },
        { tag: "Rule 2", q: "Show Rule 2 for a concave lens.", a: "The ray directed towards F₂ (on the far side) comes out parallel to the principal axis.", setup: { type: "concave", U: 20, rays: { r1: false, r2: true, r3: false } } },
        { tag: "Rule 3", q: "Show Rule 3.", a: "The ray through the optical centre O goes straight on without deviation.", setup: { type: "convex", U: 25, rays: { r1: false, r2: false, r3: true } } }
      ]
    },
    /* ---------------- 9.3.4 convex lens ---------------- */
    {
      id: "convex-lens", num: "9.3.4–9.3.5", title: "Image formation by a convex lens", chip: "Convex lens",
      lead: "Place the object at each position in Table 9.4, including “At infinity”. Try “Cover the upper half of the lens” for Exercise 9.",
      sim: ["optics", { kind: "lens", type: "convex", U: 25, F: 10 }],
      explain: [
        "The position, size and nature of the image formed by a convex lens depend on the position of the object relative to O, F₁ and 2F₁ (Table 9.4).",
        "Object at infinity: image at F₂, highly diminished (point-sized), real and inverted.",
        "Object beyond 2F₁: image between F₂ and 2F₂, diminished, real and inverted. Object at 2F₁: image at 2F₂, same size, real and inverted.",
        "Object between F₁ and 2F₁: image beyond 2F₂, enlarged, real and inverted. Object at F₁: image at infinity, infinitely large or highly enlarged, real and inverted.",
        "Object between F₁ and O: image on the same side of the lens as the object, enlarged, virtual and erect. Used this way, a convex lens is a magnifying glass.",
        "If half the lens is covered, it still forms a complete image, because every part of the lens forms the whole image. The image is less bright."
      ],
      activities: [
        { n: "9.12", title: "Images formed by a convex lens on a screen",
          steps: ["Find the approximate focal length of a convex lens (as in Activity 9.11).", "Draw five parallel chalk lines on a long table, one focal length apart. Place the lens on the central line and mark the other lines 2F₁, F₁, F₂ and 2F₂.", "Place a burning candle far beyond 2F₁ and get a sharp image on a screen on the other side. Note the nature, position and relative size of the image.", "Repeat with the candle just beyond 2F₁, at 2F₁, between F₁ and 2F₁, at F₁, and between F₁ and O. Tabulate your observations."],
          observe: "The results match Table 9.4: real, inverted images on the screen for every position beyond F₁; image at infinity when the candle is at F₁; and with the candle between F₁ and O, no image on the screen but a virtual, erect, enlarged image seen through the lens.",
          setup: { type: "convex", U: 40 } }
      ],
      questions: [
        { tag: "In-text", q: "A convex lens forms a real and inverted image of a needle at a distance of 50 cm from it. Where is the needle placed in front of the convex lens if the image is equal to the size of the object? Also, find the power of the lens.", a: ["A real image of the same size forms when the object is at 2F₁ and the image at 2F₂. So the needle is 50 cm in front of the lens (u = −50 cm), and 2f = 50 cm.", "f = 25 cm = 0.25 m, so P = 1/f = 1/0.25 m = +4 D."], setup: { type: "convex", F: 25, U: 50 } },
        { tag: "Exercise 3", q: "Where should an object be placed in front of a convex lens to get a real image of the size of the object?", options: ["At the principal focus of the lens", "At twice the focal length", "At infinity", "Between the optical centre of the lens and its principal focus"], a: "(b) At twice the focal length (at 2F₁). The image is then at 2F₂: real, inverted and the same size.", setup: { type: "convex", F: 10, U: 20 } },
        { tag: "Exercise 9", q: "One-half of a convex lens is covered with a black paper. Will this lens produce a complete image of the object? Verify your answer experimentally. Explain your observations.", a: ["Yes. The uncovered half still refracts rays from every point of the object, and they meet to form the complete image.", "Since only half the light passes, the image is less bright."], setup: { type: "convex", F: 10, U: 25, cover: true } },
        { tag: "Exercise 10", q: "An object 5 cm in length is held 25 cm away from a converging lens of focal length 10 cm. Draw the ray diagram and find the position, size and the nature of the image formed.", a: ["u = −25 cm, f = +10 cm. 1/v = 1/f + 1/u = 1/10 − 1/25 = 3/50, so v = +16.7 cm (on the other side of the lens).", "m = v/u = 16.7/(−25) = −0.67, so h′ = −0.67 × 5 cm = −3.3 cm.", "The image is real, inverted and diminished."], setup: { type: "convex", F: 10, U: 25, h: 5 } },
        { tag: "Exercise 6", q: "Which of the following lenses would you prefer to use while reading small letters found in a dictionary?", options: ["A convex lens of focal length 50 cm.", "A concave lens of focal length 50 cm.", "A convex lens of focal length 5 cm.", "A concave lens of focal length 5 cm."], a: "(c) A convex lens of focal length 5 cm. With the letters between F₁ and O it gives a virtual, erect, enlarged image, and a short focal length gives a larger magnification.", setup: { type: "convex", F: 5, U: 4 } }
      ]
    },
    /* ---------------- 9.3.4 concave lens ---------------- */
    {
      id: "concave-lens", num: "9.3.4–9.3.5", title: "Image formation by a concave lens", chip: "Concave lens",
      lead: "A concave lens has only the two cases of Table 9.5. Move the object and watch the image stay virtual, erect and diminished.",
      sim: ["optics", { kind: "lens", type: "concave", U: 20, F: 10 }],
      explain: [
        "Object at infinity: image at the focus F₁, highly diminished (point-sized), virtual and erect.",
        "Object between infinity and the optical centre O: image between F₁ and O, on the same side as the object, diminished, virtual and erect.",
        "A concave lens always gives a virtual, erect and diminished image, whatever the position of the object."
      ],
      activities: [
        { n: "9.13", title: "Looking at a candle through a concave lens",
          steps: ["Place a concave lens on a stand and a burning candle on one side of it.", "Look through the lens from the other side. Try to get the image on a screen; if you cannot, observe it through the lens.", "Note the nature, relative size and approximate position of the image.", "Move the candle away from the lens. What happens to the size of the image? What if the candle is very far away?"],
          observe: "No image forms on the screen: it is virtual, erect and diminished, on the same side as the candle, between F₁ and O. As the candle moves away the image becomes smaller and moves towards F₁; for a very distant candle it is point-sized at F₁.",
          setup: { type: "concave", U: 20 } }
      ],
      questions: [
        { tag: "Exercise 11", q: "A concave lens of focal length 15 cm forms an image 10 cm from the lens. How far is the object placed from the lens? Draw the ray diagram.", a: ["The image of a concave lens is virtual, on the same side as the object: v = −10 cm, f = −15 cm.", "1/u = 1/v − 1/f = −1/10 + 1/15 = −1/30, so u = −30 cm.", "The object is 30 cm from the lens."], setup: { type: "concave", F: 15, U: 30 } }
      ]
    },
    /* ---------------- 9.3.6–9.3.7 ---------------- */
    {
      id: "lens-formula", num: "9.3.6–9.3.7", title: "Sign convention for lenses; lens formula and magnification", chip: "Lens formula",
      lead: "Distances are measured from the optical centre O. The working with the lens formula is shown below the diagram.",
      sim: ["optics", { kind: "lens", type: "convex", U: 15, F: 10, h: 2, sign: true }],
      explain: [
        "Lenses follow the same New Cartesian Sign Convention as mirrors, but all distances are measured from the optical centre O.",
        "The focal length of a convex lens is positive and that of a concave lens is negative.",
        "Lens formula: 1/v − 1/u = 1/f. It holds for any spherical lens and any position of the object.",
        "Magnification m = h′/h. For a lens it is also m = v/u.",
        "Negative m: real and inverted image. Positive m: virtual and erect image."
      ],
      formulas: [["Lens formula", "1/v − 1/u = 1/f"], ["Magnification", "m = h′/h = v/u"]],
      examples: [
        { n: "9.3", q: "A concave lens has focal length of 15 cm. At what distance should the object from the lens be placed so that it forms an image at 10 cm from the lens? Also, find the magnification produced by the lens.",
          solution: ["A concave lens always forms a virtual, erect image on the same side as the object: v = −10 cm, f = −15 cm.", "1/u = 1/v − 1/f = −1/10 + 1/15 = (−3 + 2)/30 = −1/30", "u = −30 cm.", "m = v/u = (−10 cm)/(−30 cm) = +1/3 ≈ +0.33."],
          answer: "The object is 30 cm from the lens. The image is virtual, erect and one-third the size of the object.",
          setup: { type: "concave", F: 15, U: 30, h: 2 } },
        { n: "9.4", q: "A 2.0 cm tall object is placed perpendicular to the principal axis of a convex lens of focal length 10 cm. The distance of the object from the lens is 15 cm. Find the nature, position and size of the image. Also find its magnification.",
          solution: ["h = +2.0 cm, f = +10 cm, u = −15 cm.", "1/v = 1/u + 1/f = −1/15 + 1/10 = (−2 + 3)/30 = 1/30", "v = +30 cm: the image is 30 cm on the other side of the lens.", "m = h′/h = v/u, so h′ = h(v/u) = 2.0 × (30/−15) = −4.0 cm, and m = v/u = −2."],
          answer: "Real and inverted, 30 cm on the other side of the lens, 4.0 cm tall (two times enlarged), m = −2.",
          setup: { type: "convex", F: 10, U: 15, h: 2 } }
      ]
    },
    /* ---------------- 9.3.8 power ---------------- */
    {
      id: "power", num: "9.3.8", title: "Power of a lens", chip: "Power",
      lead: "Change the power to see the focal length. Below, add lenses to the optician's trial frame: powers of lenses in contact simply add.",
      sim: ["lensPower", { P: 2, frame: [2, 0.25] }],
      explain: [
        "The degree of convergence or divergence of light rays achieved by a lens is expressed by its power.",
        "The power of a lens is the reciprocal of its focal length: P = 1/f. If f is in metres, P is in dioptres (D).",
        "1 dioptre is the power of a lens whose focal length is 1 metre: 1 D = 1 m⁻¹.",
        "The power of a convex lens is positive and that of a concave lens is negative.",
        "Opticians prescribe lenses by power. A lens of power +2.0 D is convex with f = +0.50 m. A lens of power −2.5 D is concave with f = −0.40 m.",
        "For lenses placed in contact, the net power is the algebraic sum of the individual powers: P = P₁ + P₂ + P₃ + … For example, +2.0 D and +0.25 D together make +2.25 D.",
        "During eye-testing, an optician puts combinations of lenses of known power in the testing frame and adds their powers. Lens systems in contact are used in cameras, microscopes and telescopes."
      ],
      formulas: [["Power of a lens", "P = 1/f  (f in metres)"], ["Unit", "1 D = 1 m⁻¹"], ["Lenses in contact", "P = P₁ + P₂ + P₃ + …"]],
      questions: [
        { tag: "In-text", q: "Define 1 dioptre of power of a lens.", a: "1 dioptre is the power of a lens whose focal length is 1 metre (1 D = 1 m⁻¹).", setup: { P: 1 } },
        { tag: "In-text", q: "Find the power of a concave lens of focal length 2 m.", a: "f = −2 m for a concave lens, so P = 1/f = 1/(−2 m) = −0.5 D.", setup: { P: -0.5 } },
        { tag: "Exercise 16", q: "Find the focal length of a lens of power −2.0 D. What type of lens is this?", a: "f = 1/P = 1/(−2.0 D) = −0.5 m = −50 cm. Negative focal length: it is a concave lens.", setup: { P: -2 } },
        { tag: "Exercise 17", q: "A doctor has prescribed a corrective lens of power +1.5 D. Find the focal length of the lens. Is the prescribed lens diverging or converging?", a: "f = 1/P = 1/1.5 m = +0.67 m (66.7 cm). Positive power: it is a converging (convex) lens.", setup: { P: 1.5 } }
      ]
    }
  ],
  exercises: [
    { n: 1, q: "Which one of the following materials cannot be used to make a lens?", options: ["Water", "Glass", "Plastic", "Clay"], a: "(d) Clay. A lens must be transparent; clay does not allow light to pass through it." },
    { n: 2, q: "The image formed by a concave mirror is observed to be virtual, erect and larger than the object. Where should be the position of the object?", options: ["Between the principal focus and the centre of curvature", "At the centre of curvature", "Beyond the centre of curvature", "Between the pole of the mirror and its principal focus."], a: "(d) Between the pole of the mirror and its principal focus.", go: { topic: "concave-mirror", setup: { type: "concave", F: 10, U: 5 } } },
    { n: 3, q: "Where should an object be placed in front of a convex lens to get a real image of the size of the object?", options: ["At the principal focus of the lens", "At twice the focal length", "At infinity", "Between the optical centre of the lens and its principal focus."], a: "(b) At twice the focal length (at 2F₁). The image forms at 2F₂, real, inverted and the same size.", go: { topic: "convex-lens", setup: { type: "convex", F: 10, U: 20 } } },
    { n: 4, q: "A spherical mirror and a thin spherical lens have each a focal length of −15 cm. The mirror and the lens are likely to be", options: ["both concave.", "both convex.", "the mirror is concave and the lens is convex.", "the mirror is convex, but the lens is concave."], a: "(a) Both concave. By the sign convention, the focal length of a concave mirror and of a concave lens is negative." },
    { n: 5, q: "No matter how far you stand from a mirror, your image appears erect. The mirror is likely to be", options: ["only plane.", "only concave.", "only convex.", "either plane or convex."], a: "(d) Either plane or convex. Both always form virtual, erect images.", go: { topic: "convex-mirror", setup: { type: "convex", F: 10, U: 40 } } },
    { n: 6, q: "Which of the following lenses would you prefer to use while reading small letters found in a dictionary?", options: ["A convex lens of focal length 50 cm.", "A concave lens of focal length 50 cm.", "A convex lens of focal length 5 cm.", "A concave lens of focal length 5 cm."], a: "(c) A convex lens of focal length 5 cm. Held with the letters between F₁ and O, it gives an enlarged, erect, virtual image; the shorter the focal length, the larger the magnification.", go: { topic: "convex-lens", setup: { type: "convex", F: 5, U: 4 } } },
    { n: 7, q: "We wish to obtain an erect image of an object, using a concave mirror of focal length 15 cm. What should be the range of distance of the object from the mirror? What is the nature of the image? Is the image larger or smaller than the object? Draw a ray diagram to show the image formation in this case.", a: ["The object should be between the pole P and the principal focus F, that is, between 0 and 15 cm from the mirror.", "The image is virtual and erect, formed behind the mirror, and larger than the object."], go: { topic: "concave-mirror", setup: { type: "concave", F: 15, U: 10 } } },
    { n: 8, q: "Name the type of mirror used in the following situations. (a) Headlights of a car. (b) Side/rear-view mirror of a vehicle. (c) Solar furnace. Support your answer with reason.", a: ["(a) Concave mirror: with the bulb at its focus, it reflects the light as a powerful parallel beam.", "(b) Convex mirror: it always gives an erect, diminished image and has a wider field of view.", "(c) Concave mirror: it concentrates sunlight at its focus, producing a lot of heat."] },
    { n: 9, q: "One-half of a convex lens is covered with a black paper. Will this lens produce a complete image of the object? Verify your answer experimentally. Explain your observations.", a: ["Yes. Rays from every point of the object still pass through the uncovered half and meet to form the complete image.", "The image is less bright, because only half as much light passes through the lens."], go: { topic: "convex-lens", setup: { type: "convex", F: 10, U: 25, cover: true } } },
    { n: 10, q: "An object 5 cm in length is held 25 cm away from a converging lens of focal length 10 cm. Draw the ray diagram and find the position, size and the nature of the image formed.", a: ["u = −25 cm, f = +10 cm. 1/v = 1/f + 1/u = 1/10 − 1/25 = 3/50, so v = +16.7 cm.", "m = v/u = −0.67, h′ = −0.67 × 5 cm = −3.3 cm.", "The image is 16.7 cm on the other side of the lens, real, inverted and diminished (3.3 cm tall)."], go: { topic: "convex-lens", setup: { type: "convex", F: 10, U: 25, h: 5 } } },
    { n: 11, q: "A concave lens of focal length 15 cm forms an image 10 cm from the lens. How far is the object placed from the lens? Draw the ray diagram.", a: ["v = −10 cm (virtual image on the same side), f = −15 cm.", "1/u = 1/v − 1/f = −1/10 + 1/15 = −1/30, so u = −30 cm: the object is 30 cm from the lens."], go: { topic: "concave-lens", setup: { type: "concave", F: 15, U: 30 } } },
    { n: 12, q: "An object is placed at a distance of 10 cm from a convex mirror of focal length 15 cm. Find the position and nature of the image.", a: ["u = −10 cm, f = +15 cm. 1/v = 1/f − 1/u = 1/15 + 1/10 = 1/6, so v = +6 cm.", "The image is 6 cm behind the mirror, virtual and erect (m = +0.6, diminished)."], go: { topic: "convex-mirror", setup: { type: "convex", F: 15, U: 10 } } },
    { n: 13, q: "The magnification produced by a plane mirror is +1. What does this mean?", a: "The image is the same size as the object (|m| = 1), and it is erect (m positive), so it is virtual.", go: { topic: "reflection", setup: { mode: "plane", d: 20 } } },
    { n: 14, q: "An object 5.0 cm in length is placed at a distance of 20 cm in front of a convex mirror of radius of curvature 30 cm. Find the position of the image, its nature and size.", a: ["f = R/2 = +15 cm, u = −20 cm. 1/v = 1/f − 1/u = 1/15 + 1/20 = 7/60, so v = +8.57 cm: 8.57 cm behind the mirror.", "m = −v/u = +0.43, so h′ = m × h = +2.14 cm.", "The image is virtual, erect and diminished (2.14 cm tall)."], go: { topic: "convex-mirror", setup: { type: "convex", F: 15, U: 20, h: 5 } } },
    { n: 15, q: "An object of size 7.0 cm is placed at 27 cm in front of a concave mirror of focal length 18 cm. At what distance from the mirror should a screen be placed, so that a sharp focussed image can be obtained? Find the size and the nature of the image.", a: ["u = −27 cm, f = −18 cm. 1/v = −1/18 + 1/27 = −1/54, so v = −54 cm: place the screen 54 cm in front of the mirror.", "m = −v/u = −2, so h′ = −14 cm.", "The image is real, inverted and enlarged (14 cm tall)."], go: { topic: "concave-mirror", setup: { type: "concave", F: 18, U: 27, h: 7 } } },
    { n: 16, q: "Find the focal length of a lens of power −2.0 D. What type of lens is this?", a: "f = 1/P = 1/(−2.0) m = −0.5 m (−50 cm). It is a concave lens.", go: { topic: "power", setup: { P: -2 } } },
    { n: 17, q: "A doctor has prescribed a corrective lens of power +1.5 D. Find the focal length of the lens. Is the prescribed lens diverging or converging?", a: "f = 1/P = 1/1.5 m = +0.67 m (66.7 cm). It is a converging (convex) lens.", go: { topic: "power", setup: { P: 1.5 } } }
  ],
  summary: [
    "Light seems to travel in straight lines.",
    "Mirrors and lenses form images of objects. Images can be either real or virtual, depending on the position of the object.",
    "The reflecting surfaces, of all types, obey the laws of reflection. The refracting surfaces obey the laws of refraction.",
    "New Cartesian Sign Conventions are followed for spherical mirrors and lenses.",
    "Mirror formula, 1/v + 1/u = 1/f, gives the relationship between the object-distance (u), image-distance (v), and focal length (f) of a spherical mirror.",
    "The focal length of a spherical mirror is equal to half its radius of curvature.",
    "The magnification produced by a spherical mirror is the ratio of the height of the image to the height of the object.",
    "A light ray travelling obliquely from a denser medium to a rarer medium bends away from the normal. A light ray bends towards the normal when it travels obliquely from a rarer to a denser medium.",
    "Light travels in vacuum with an enormous speed of 3 × 10⁸ m s⁻¹. The speed of light is different in different media.",
    "The refractive index of a transparent medium is the ratio of the speed of light in vacuum to that in the medium.",
    "In case of a rectangular glass slab, the refraction takes place at both air-glass interface and glass-air interface. The emergent ray is parallel to the direction of incident ray.",
    "Lens formula, 1/v − 1/u = 1/f, gives the relationship between the object-distance (u), image-distance (v), and the focal length (f) of a spherical lens.",
    "Power of a lens is the reciprocal of its focal length. The SI unit of power of a lens is dioptre."
  ]
});
