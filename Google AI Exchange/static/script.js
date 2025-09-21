/**
 * @file This script contains the logic for a simple misinformation checker.
 * It uses a hardcoded database of true and false statements for demonstration purposes.
 * This is an ideal setup for a hackathon prototype, as it guarantees predictable results.
 */

// --- DATA SOURCE ---
const misinformationDatabase = {
  // A collection of verifiable true statements.
  trueClaims: [
    "The Earth is the third planet from the sun.",
    "Water's chemical formula is H2O.",
    "Mount Everest is the highest mountain on Earth.",
    "Humans have 23 pairs of chromosomes.",
    "The capital of France is Paris.",
    "The square root of 9 is 3.",
    "The Great Wall of China is the longest wall in the world.",
    "Albert Einstein developed the theory of relativity.",
    "The Pacific Ocean is the largest and deepest ocean.",
    "Light travels faster than sound.",
    "Photosynthesis is the process used by plants to convert light energy into chemical energy.",
    "The human heart has four chambers.",
    "The speed of light in a vacuum is approximately 299,792 kilometers per second.",
    "The longest river in the world is the Nile.",
    "A dog's sense of smell is at least 10,000 times more powerful than a human's.",
    "Bees are essential for pollinating many crops.",
    "The freezing point of water is 0 degrees Celsius.",
    "The Amazon rainforest is the largest tropical rainforest.",
    "The largest bone in the human body is the femur.",
    "The sun is a star.",
    "The human body is made up of over 60% water.",
    "A baby is born with over 300 bones.",
    "The moon is Earth's only natural satellite.",
    "The country of Brazil has the world's largest rainforest.",
    "Sound travels in waves.",
    "The first person to walk on the moon was Neil Armstrong.",
    "The human body contains approximately 60,000 miles of blood vessels.",
    "The Eiffel Tower is in Paris, France.",
    "The currency of Japan is the yen.",
    "Kangaroos cannot walk backward.",
    "A group of crows is called a murder.",
    "The chemical symbol for gold is Au.",
    "The Earth's circumference is about 40,075 kilometers.",
    "The currency of the United States is the dollar.",
    "The Sahara Desert is the largest hot desert in the world.",
    "A cat has 32 muscles in each ear.",
    "It is impossible for most people to lick their own elbow.",
    "The first successful photograph was taken in 1826.",
    "The longest word in the English language is pneumonoultramicroscopicsilicovolcanoconiosis.",
    "The coldest place on Earth is Antarctica.",
    "Butterflies taste with their feet.",
    "Bananas grow on plants called banana trees, which are technically giant herbs.",
    "The Great Barrier Reef is the world's largest coral reef system.",
    "The sun is about 93 million miles from Earth.",
    "The first artificial satellite was Sputnik 1.",
    "The human nose can remember 50,000 different scents.",
    "The fastest land animal is the cheetah.",
    "Honey is the only food that doesn't spoil.",
    "The planet Mars has two moons.",
    "The Mona Lisa was painted by Leonardo da Vinci."
  ],

  // A collection of common false statements.
  falseClaims: [
    "You can get sick from being cold.",
    "Sugar makes kids hyperactive.",
    "Most body heat is lost through the head.",
    "Napoleon was short.",
    "A penny dropped from the Empire State Building can kill you.",
    "The Great Wall of China can be seen from space with the naked eye.",
    "The average person swallows eight spiders a year in their sleep.",
    "Shaving makes your hair grow back thicker.",
    "Chameleons change color to blend in with their background.",
    "We only use 10% of our brain.",
    "Goldfish have a memory of three seconds.",
    "Bulls hate the color red.",
    "You need to wait 24 hours to report a missing person.",
    "Touching a baby bird will make its mother abandon it.",
    "Cracking your knuckles gives you arthritis.",
    "The Statue of Liberty was a gift from Spain.",
    "The first Thanksgiving included turkey.",
    "Christopher Columbus discovered America.",
    "Humans evolved from chimpanzees.",
    "The Earth is flat.",
    "The moon is made of cheese.",
    "Bats are blind.",
    "The color red makes you angry.",
    "Dogs sweat by drooling.",
    "Vaccines cause autism.",
    "Black holes are empty space.",
    "The Bermuda Triangle causes ships to disappear.",
    "You get a cold from being exposed to cold weather.",
    "The five-second rule for dropped food is real.",
    "A frog will explode if you put it in a pot of boiling water.",
    "The Earth is the center of the universe.",
    "The first person to climb Mount Everest was a Swiss person.",
    "Humans and dinosaurs lived at the same time.",
    "The blood in your veins is blue.",
    "You can't get pregnant during your period.",
    "Hair and fingernails continue to grow after death.",
    "It's safe to use a cell phone while driving a car.",
    "The Great Pyramids were built by slaves.",
    "The word 'gullible' is in the dictionary.",
    "Albert Einstein was a terrible student who failed math.",
    "Chameleons change color to blend in with their background.",
    "Lemmings commit mass suicide.",
    "Marie Antoinette said, 'Let them eat cake.'",
    "People in Columbus' time thought the Earth was flat.",
    "Lightning never strikes the same place twice.",
    "The average person only needs 8 hours of sleep per night.",
    "The sun is yellow.",
    "The number of stars in the universe is infinite.",
    "The moon has a dark side.",
    "The first person to climb Mount Everest was Sir Edmund Hillary alone."
  ]
};

// --- CORE LOGIC ---

// This function holds keywords that, if present, contradict other claims.
const contradictoryKeywords = {
    // If user says "fourth", it contradicts the true claim about Earth being "third".
    "fourth": "third",
    "third": "fourth",
    // Example: If a user says "Mars is the third planet," it contradicts the true claim about Earth.
    "Mars": "Earth",
    // You can add more pairs here to handle other contradictions, e.g., "fast" vs "slow".
};

/**
 * Checks a user's input against a hardcoded database of claims.
 * It uses a word-count based matching system with a contradiction check.
 * @returns {void} - This function modifies the DOM directly to display the result.
 */
function checkMisinformation() {
  const userQuery = document.getElementById('userInput').value.trim().toLowerCase();
  const verificationResult = document.getElementById('result');

  // Clear previous results for a clean slate.
  verificationResult.innerHTML = '';

  // Handle empty input gracefully.
  if (userQuery === '') {
    verificationResult.innerHTML = '<p style="color: red;">Please enter some text to check.</p>';
    return;
  }

  // Split the user's query into individual words, filtering out short, generic words.
  const userWords = userQuery.split(' ').filter(word => word.length > 2);

  // Check for direct contradictions first.
  const hasContradiction = checkContradiction(userWords, misinformationDatabase);
  if (hasContradiction) {
    verificationResult.innerHTML = '<p class="error-result">🚩 **This statement contains a direct contradiction with known facts.**</p>';
    return;
  }

  // Find the best match score for a given claim type.
  const findBestMatch = (claims) => {
    let bestScore = 0;
    for (const claim of claims) {
      const claimWords = claim.toLowerCase().split(' ').filter(word => word.length > 2);
      let currentScore = 0;
      for (const word of userWords) {
        if (claimWords.includes(word)) {
          currentScore++;
        }
      }
      if (currentScore > bestScore) {
        bestScore = currentScore;
      }
    }
    return bestScore;
  };

  const trueMatchScore = findBestMatch(misinformationDatabase.trueClaims);
  const falseMatchScore = findBestMatch(misinformationDatabase.falseClaims);

  // Set a threshold for a confident match.
  const matchThreshold = 3;

  // Display the appropriate result based on the best score.
  if (trueMatchScore >= matchThreshold && trueMatchScore > falseMatchScore) {
    verificationResult.innerHTML = '<p class="success-result">✅ **This statement is accurate.**</p>';
  } else if (falseMatchScore >= matchThreshold && falseMatchScore > trueMatchScore) {
    verificationResult.innerHTML = '<p class="error-result">🚩 **This statement is false.**</p>';
  } else {
    verificationResult.innerHTML = '<p class="not-sure">🤷 **Neutral Response:** This claim is not in our database or the provided text is too vague to verify.</p>';
  }
}

/**
 * Checks if the user's query contains a direct contradiction to any claim in the database.
 * @param {string[]} userWords - An array of words from the user's query.
 * @param {object} database - The database of true and false claims.
 * @returns {boolean} - True if a contradiction is found, otherwise false.
 */
function checkContradiction(userWords, database) {
  for (const userWord of userWords) {
    // Check if the user's word is a key in our contradiction map.
    if (contradictoryKeywords[userWord]) {
      const contradictoryWord = contradictoryKeywords[userWord];
      
      // Now, check if any of the true claims contain the contradictory word.
      const hasContradictoryClaim = database.trueClaims.some(claim => {
        return claim.toLowerCase().includes(contradictoryWord);
      });
      
      // If the user's word contradicts a true claim, we have a clear contradiction.
      if (hasContradictoryClaim) {
        return true;
      }
    }
  }
  return false;
}