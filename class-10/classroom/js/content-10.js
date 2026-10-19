/* ============================================================
   Chapter 10 — The Human Eye and the Colourful World (content)
   ============================================================ */
"use strict";
CR.chapters.push({
  "id": "eye",
  "num": 10,
  "short": "Human Eye",
  "title": "The Human Eye and the Colourful World",
  "notes": "../human-eye.html",
  "topics": [
    {
      "id": "defects",
      "num": "10.1–10.2",
      "title": "Defects of vision",
      "chip": "Defects of vision",
      "lead": "Pick an eye and an object. Watch where the rays meet, then put on the spectacle lens.",
      "sim": [
        "eye",
        {}
      ],
      "explain": [
        "The eye lens forms a real, inverted image on the retina. The ciliary muscles change the curvature, and so the focal length, of the eye lens. This ability is called accommodation.",
        "For a young adult with normal vision, the near point is about 25 cm and the far point is at infinity.",
        "Myopia (near-sightedness): distant objects look blurred because their image forms in front of the retina. Causes: excessive curvature of the eye lens, or elongation of the eyeball. Corrected with a concave lens of suitable power.",
        "Hypermetropia (far-sightedness): nearby objects look blurred because the near point is farther than 25 cm and the image would form behind the retina. Causes: the focal length of the eye lens is too long, or the eyeball is too small. Corrected with a convex lens of suitable power.",
        "Presbyopia: with age the ciliary muscles weaken and the eye lens becomes less flexible, so the near point moves away. Bifocal lenses are often needed.",
        "Cataract: in old age the eye lens may become milky and cloudy. Vision can be restored by cataract surgery."
      ],
      "formulas": [
        [
          "Normal near point",
          "about 25 cm"
        ],
        [
          "Power of a lens",
          "P = 1/f  (f in metres)"
        ],
        [
          "Lens for myopia",
          "concave, f = −(far point distance)"
        ]
      ],
      "questions": [
        {
          "q": "The far point of a myopic person is 80 cm in front of the eye. What is the nature and power of the lens needed?",
          "a": "A concave lens that makes distant objects seem to be at the far point: f = −80 cm = −0.8 m, so P = 1/f = −1.25 D."
        },
        {
          "q": "A person needs a lens of power −5.5 D to correct distant vision and +1.5 D to correct near vision. What are the focal lengths of these lenses?",
          "a": "(i) f = 1/(−5.5) m = −0.18 m = −18.2 cm (concave). (ii) f = 1/1.5 m = +0.67 m = +66.7 cm (convex)."
        },
        {
          "q": "The near point of a hypermetropic eye is 1 m. What is the power of the lens needed? (Near point of a normal eye = 25 cm.)",
          "a": "The lens must make an object at 25 cm appear to be at 1 m: u = −25 cm, v = −100 cm. 1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100, so f = +33.3 cm = 0.333 m and P = +3.0 D (convex)."
        },
        {
          "q": "Why is a normal eye not able to see clearly objects placed closer than 25 cm?",
          "a": "The ciliary muscles cannot make the eye lens any more curved, so its focal length cannot get any shorter."
        },
        {
          "q": "What happens to the image distance in the eye when we increase the distance of an object from the eye?",
          "a": "It stays the same: the image still forms on the retina. Instead, the eye lens becomes thinner and its focal length increases."
        },
        {
          "q": "The eye focuses on objects at different distances by adjusting the focal length of the eye lens. What is this called?",
          "a": "Accommodation."
        }
      ]
    },
    {
      "id": "prism",
      "num": "10.3–10.4",
      "title": "Prism and dispersion",
      "chip": "Prism and dispersion",
      "lead": "Change the angle of incidence, then repeat Newton's experiment with a second, inverted prism.",
      "sim": [
        "prism",
        {}
      ],
      "explain": [
        "A triangular glass prism has two triangular bases and three rectangular lateral surfaces. The angle between two lateral faces is the angle of the prism.",
        "Light bends twice, each time towards the base. The angle between the incident ray and the emergent ray is the angle of deviation.",
        "A prism splits white light into a band of seven colours, VIBGYOR: violet, indigo, blue, green, yellow, orange and red. This is dispersion, and the band is a spectrum.",
        "Different colours bend through different angles: red bends the least and violet the most.",
        "Newton placed a second, identical prism upside down after the first. The colours recombined into white light, showing that sunlight is made of seven colours.",
        "A rainbow is a natural spectrum. Raindrops act like small prisms: they refract and disperse sunlight, reflect it inside, and refract it again as it leaves. A rainbow always forms opposite the Sun."
      ],
      "formulas": [
        [
          "Colours of the spectrum",
          "V I B G Y O R"
        ],
        [
          "Bending",
          "red least, violet most"
        ],
        [
          "Angle of deviation",
          "between incident and emergent rays"
        ]
      ],
      "questions": [
        {
          "q": "Why do different colours bend through different angles in a prism?",
          "a": "Each colour travels at a different speed in glass, so glass has a slightly different refractive index for each colour. Violet slows down most and bends most; red bends least."
        },
        {
          "q": "Which colour bends the least, and which the most?",
          "a": "Red the least, violet the most."
        },
        {
          "q": "What is the angle of deviation?",
          "a": "The angle between the direction of the incident ray and the direction of the emergent ray."
        },
        {
          "q": "What did Newton see when he placed a second, identical prism upside down after the first?",
          "a": "The colours recombined and white light came out, showing that white light is made of seven colours."
        },
        {
          "q": "Explain how a rainbow is formed.",
          "a": "Tiny raindrops act like prisms: they refract and disperse sunlight as it enters, reflect it inside the drop, and refract it again as it comes out. We see a rainbow when the Sun is behind us."
        }
      ]
    },
    {
      "id": "scattering",
      "num": "10.5–10.6",
      "title": "Atmospheric refraction and scattering",
      "chip": "Atmospheric refraction and scattering",
      "lead": "Compare the sky with and without air to see why the sky is blue. The sunrise and sunset buttons are extra: the colour of the Sun at sunrise and sunset is not in the CBSE syllabus.",
      "sim": [
        "scatter",
        {}
      ],
      "explain": [
        "Atmospheric refraction: hot air is lighter and has a slightly lower refractive index than cooler air. Light bends as it passes through layers of changing refractive index, so objects seen through hot air seem to waver.",
        "Stars twinkle because starlight is bent by the changing atmosphere, so the star's apparent position and brightness keep changing. Planets are much closer and act as extended sources, so the changes average out and they do not twinkle.",
        "Because of atmospheric refraction we see the Sun about 2 minutes before actual sunrise and about 2 minutes after actual sunset.",
        "Tyndall effect: fine particles scatter light and make a beam visible, as when sunlight enters a smoke-filled room through a small hole or passes through the canopy of a dense forest.",
        "The colour of scattered light depends on particle size. Very fine particles scatter mainly blue light, larger particles scatter longer wavelengths, and large enough particles scatter all colours, so the light looks white.",
        "The clear sky is blue because air molecules and fine particles scatter blue light (shorter wavelength) much more strongly than red.",
        "Danger signal lights are red because red is scattered the least by fog or smoke, so it can be seen from far away.",
        "With no atmosphere there would be no scattering and the sky would look dark, as it does to passengers flying at very high altitudes.",
        "Extra (not in the CBSE syllabus): at sunrise and sunset sunlight crosses much more air, most of the blue is scattered away, and the Sun looks reddish."
      ],
      "formulas": [
        [
          "Scattering by fine particles",
          "blue (short λ) ≫ red (long λ)"
        ],
        [
          "Advance sunrise / delayed sunset",
          "about 2 minutes each"
        ]
      ],
      "questions": [
        {
          "q": "Why do stars twinkle?",
          "a": "Starlight is refracted continuously as it passes through the atmosphere, whose conditions keep changing. So the apparent position of the star shifts slightly and the amount of light entering the eye flickers."
        },
        {
          "q": "Explain why the planets do not twinkle.",
          "a": "Planets are much closer to the Earth and are seen as extended sources, like a collection of many point sources. The flickering from all these points averages out."
        },
        {
          "q": "Why does the sky appear dark instead of blue to an astronaut?",
          "a": "At that height there is no atmosphere to scatter sunlight towards the eye."
        },
        {
          "q": "Why is the colour of the clear sky blue?",
          "a": "Air molecules and fine particles are smaller than the wavelength of visible light and scatter blue light much more than red. This scattered blue light reaches our eyes from all directions."
        },
        {
          "q": "Why are danger signal lights red?",
          "a": "Red light is scattered the least by fog or smoke, so it can be seen in the same colour from far away."
        },
        {
          "q": "What is the Tyndall effect? Give an example.",
          "a": "The scattering of light by fine particles, which makes the path of a beam visible, for example a beam of sunlight entering a smoke-filled room through a small hole."
        }
      ]
    }
  ]
});
