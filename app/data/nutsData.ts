export interface NutData {
  id: number;
  slug: string;
  name: string;
  latinName: string;
  image: string;
  description: string;
  allergyInfo: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythic' | 'Mitos';
}

export const nutsData: NutData[] = [
  {
    id: 0,
    slug: 'almond',
    name: 'Almond',
    latinName: 'Prunus dulcis',
    image: '/nuts/almond.jpg',
    description: 'An economically important tree and its edible seed. Native to southwestern Asia, almonds are grown primarily in Mediterranean climates between 28° and 48° N and between 20° and 40° S. California produces nearly 80 percent of the world\'s supply. Almonds grown as nuts can be eaten raw, blanched, or roasted and are commonly used in baking. Almonds are high in protein and fat and provide small amounts of iron, calcium, phosphorus, and vitamins A, B complex, and E.',
    allergyInfo: 'Almond allergy is an immune system reaction to proteins contained in almonds. People with almond allergies tend to have severe reactions. Often starting with a rash followed by swelling of the mouth or face, then the throat. Symptoms often appear within minutes, but can also appear within hours. People who have had mild almond allergic reactions are at risk for more severe reactions later in life. So even if your first exposure did not result in anaphylaxis, anaphylaxis can occur later.\n\nAlmond Allergy Symptoms:\n- Stomach pain, cramps, nausea, and vomiting\n- Rash or hives\n- Difficulty swallowing\n- Itching of the mouth, throat, eyes, skin, or other areas\n- Swelling of the face and throat\n- Shortness of breath\n- Anaphylaxis\n\nAlmond Allergy Treatment:\nThere is no treatment that can cure almond allergy permanently. However, allergic reactions can be controlled by avoiding consumption of almonds and their derivatives. If a reaction occurs, the use of antihistamines or epinephrine injections may be necessary as directed by a doctor.',
    rarity: 'Uncommon',
  },
  {
    id: 1,
    slug: 'brazil-nut',
    name: 'Brazil Nut',
    latinName: 'Bertholletia excelsa',
    image: '/nuts/brazilnut.jpg',
    description: 'Edible seeds from a large South American tree (family Lecythidaceae) found in the Amazon forests of Brazil, Peru, Colombia, and Ecuador. Brazil nuts are best known in the Brazilian state of Pará, where they are called castanha-do-pará (Pará nut) and are grown as one of the world\'s major commercial nuts. Brazil nuts are commonly eaten raw or blanched and are rich in protein, dietary fiber, thiamin, selenium, copper, and magnesium. The oil is often used in shampoos, soaps, hair conditioners, and skin care products.',
    allergyInfo: 'Allergies to tree nuts such as Brazil nuts are common and often severe. This type of allergy usually develops by age 2, and the number of tree nuts that cause allergies can increase as you get older. Some people with Brazil nut allergies may also experience symptoms when consuming other seemingly unrelated foods. This is called cross-reactivity and occurs when your immune system identifies proteins, or components, in different substances as being structurally similar or biologically related, triggering a response. The most common cross-reactivity with Brazil nuts is plant foods, such as tree nuts, fruits, soy, vegetables, and legumes.\n\nIf you experience an itchy mouth or ears, an itchy throat, hives around the mouth, or swelling of the lips, tongue, or throat after eating Brazil nuts, fresh fruit, raw vegetables, or other tree nuts, you may have Pollen Food Allergy Syndrome (PFAS) or also called Oral Allergy Syndrome (OAS).\nThis condition occurs because of the immune system\'s reaction to similar proteins between the food and pollen.\n\nAs a quick treatment, immediately stop consuming the offending food, gargle with water to reduce itching, and take antihistamines if available. If symptoms worsen such as shortness of breath, dizziness, or severe swelling, seek immediate medical attention or call emergency services.',
    rarity: 'Legendary',
  },
  {
    id: 2,
    slug: 'cashew',
    name: 'Cashew',
    latinName: 'Anacardium occidentale',
    image: '/nuts/cashew.png',
    description: 'The cashew (Anacardium occidentale) is an evergreen shrub or tree of the Anacardiaceae family, grown for its distinctive curved edible seeds, commonly called "cashews" although they are not true nuts. Cultivated cashew trees are native to the Americas, but are grown commercially primarily in Brazil and India. The seeds, which are rich in oil and have a distinctive flavor, are often used in South and Southeast Asian cuisine, and are a characteristic ingredient in various chicken and vegetarian dishes in South India. In Western countries, these seeds are commonly consumed as a high-quality protein-rich snack.',
    allergyInfo: 'Cashew allergy is a type of tree nut allergy that occurs when a person\'s immune system reacts to proteins in cashews. This allergy can cause symptoms ranging from mild itching to severe, potentially life-threatening allergic reactions.\n\nCashew allergy symptoms are generally similar to other food allergies and can appear within minutes to several hours after consuming cashews.\n\nSome symptoms that may appear include:\n- Hives or angioedema (swelling of the skin)\n- Abdominal pain, nausea, vomiting, or diarrhea\n- Itchy skin\n- Shortness of breath, coughing, or wheezing\n- Sneezing\n- Hoarseness or a feeling of tightness in the throat\n- Itchy, swollen, or watery eyes\n- Swelling of the face or throat\n- Decreased blood pressure\n\nQuick Handling:\nIf you experience symptoms after consuming cashews, immediately stop consuming the food and rinse your mouth with water.\nTake antihistamine medication if available to relieve mild reactions.\nHowever, if severe symptoms such as difficulty breathing, severe swelling, or fainting appear, seek emergency medical attention immediately or call the nearest emergency services, as this condition could indicate anaphylaxis which requires immediate treatment.',
    rarity: 'Uncommon',
  },
  {
    id: 3,
    slug: 'chestnut',
    name: 'Chestnut',
    latinName: 'Castanea',
    image: '/nuts/chestnut.jpg',
    description: 'Chestnuts are a genus of broad-leaved trees in the Fagaceae family, consisting of seven species and growing in temperate regions of the northern hemisphere. The fruit is similar to a walnut and contains an edible nut. Several types of chestnuts are cultivated as ornamental plants and timber producers. Some species are known as chinquapins, which are related to Castanopsis. Please note, several other plants are also called "chestnuts" but are not included in the genus Castanea, such as Cape chestnut, horse chestnut, and water chestnut.',
    allergyInfo: 'One of the main concerns in consuming or being exposed to chestnuts is the possibility of allergic reactions in some people. Allergy symptoms can include skin itching, an itchy throat, and swelling of the lips, face, or hands. In rare cases, this reaction can progress to difficulty breathing or even anaphylaxis, which is a medical emergency and requires immediate treatment.\n\nQuick Handling:\nIf you experience mild allergy symptoms, such as itching or a rash, immediately stop consuming chestnuts and take antihistamines if available. However, if severe symptoms such as difficulty breathing, severe swelling, or fainting appear, seek emergency medical attention immediately.',
    rarity: 'Rare',
  },
  {
    id: 4,
    slug: 'hazelnut',
    name: 'Hazelnut',
    latinName: 'Corylus avellana',
    image: '/nuts/hazelnut.png',
    description: 'A genus consisting of about 15 species of shrubs and trees in the birch family (Betulaceae) and the edible nuts they produce. These plants are native to the north temperate climate zone. Some species have high commercial value because of their nuts, and a number of other species are valuable hedge and ornamental trees, grown for their colorful autumn leaves. Oil from the European hazel, or common hazel (Corylus avellana), is used in food products, perfumes, and soaps; the tree produces a soft reddish-white wood, useful for small items such as tool handles and walking sticks.',
    allergyInfo: 'Hazelnut allergy is a type of food allergy that belongs to the tree nut allergy group. This allergy is one of the six most common tree nut allergies, along with almond, walnut, pistachio, pecan, and cashew. In the United States, tree nut allergies affect about 0.5% to 1% of the population. Most cases of tree nut allergy are detected in childhood, usually after children start consuming various solid foods containing tree nuts. Hazelnut allergy symptoms can appear after consuming nuts directly or through foods contaminated with hazelnuts.\n\nHazelnut allergy symptoms common include:\n- Itchy skin\n- Hives (raised red rash)\n- Oral Allergy Syndrome (OAS) — a condition where the mouth area experiences itching or swelling after consuming trigger foods\n\nOAS symptoms from hazelnut are usually swelling and itching around:\n- Mouth\n- Tongue\n- Lips\n- Throat\n- Face\nThis condition often arises because of cross-reactivity between birch pollen and proteins in hazelnut that have similar structures.\n\nSevere Reaction (Anaphylaxis)\nIn some cases, hazelnut allergy can cause anaphylaxis, a severe allergic reaction that can be life-threatening. This reaction usually appears within an hour after consuming hazelnuts.\nSymptoms include:\n- Feeling like there is a lump in the throat\n- Hoarseness or difficulty speaking\n- Coughing and wheezing\n- Difficulty breathing or shortness of breath\n\nQuick Handling:\nIf you experience a mild reaction such as itching or a rash, immediately stop consuming hazelnuts and take antihistamines if available. However, if severe symptoms such as shortness of breath, throat swelling, or fainting occur, seek emergency medical attention immediately. People with severe allergies are advised to always carry an epinephrine auto-injector (EpiPen) as a first aid step against anaphylaxis.',
    rarity: 'Uncommon',
  },
  {
    id: 5,
    slug: 'macadamia',
    name: 'Macadamia',
    latinName: 'Macadamia integrifolia',
    image: '/nuts/macadamia.jpg',
    description: 'Macadamia (genus Macadamia) is a genus of four species of evergreen trees belonging to the Proteaceae family, known for their delicious edible seeds. These trees are native to the coastal rainforests and scrublands of what is now known as Queensland in northeastern Australia, and are grown commercially in a number of subtropical regions. These seeds are commonly known as macadamia nuts, often roasted and salted, or used by bakers and chocolatiers in cakes and chocolates. These seeds are a good source of calcium, phosphorus, iron, and B vitamins, and contain 73 percent fat.',
    allergyInfo: 'The immune system\'s response to proteins in macadamia nuts is the primary cause of allergic reactions. Proteins such as 2S albumin and 11S globulin found in Macadamia integrifolia can act as allergens. Once consumed, these proteins will bind to immunoglobulin E (IgE) antibodies on mast cells and basophils, which then trigger the release of histamine and other inflammatory mediators. This process is what causes various allergy symptoms.\n\nMacadamia nut allergy symptoms can include:\n- Itching on the skin or mouth\n- Hives or red rash\n- Digestive issues such as stomach pain, nausea, or vomiting\n- Coughing, shortness of breath, or wheezing\n- Swelling of the face, lips, or throat\n- In severe cases: anaphylaxis, a systemic reaction that can be life-threatening\n\nQuick Handling:\nIf mild symptoms appear, such as itching or a rash, immediately stop consuming macadamia nuts and take antihistamine medication if available. For severe symptoms such as difficulty breathing, dizziness, or extreme swelling, immediately call emergency medical services or go to the nearest hospital.\nPeople with severe allergies are advised to always carry an epinephrine auto-injector (EpiPen) and avoid processed foods that potentially contain macadamia nuts or their oil.\n\nIn addition, it is important to read food labels carefully, as macadamia is often found in products such as chocolates, cakes, granola, and mixed nut butters. Educating yourself and your family about this allergy is very helpful in preventing accidental exposure.',
    rarity: 'Rare',
  },
  {
    id: 6,
    slug: 'peanut',
    name: 'Peanut',
    latinName: 'Arachis hypogaea',
    image: '/nuts/peanut.jpg',
    description: 'The peanut (Arachis hypogaea), a legume from the pea family (Fabaceae), is grown for its edible seeds. Native to tropical South America, peanuts were introduced to Old World tropics early on. Peanut seeds are a nutrient-rich food, high in protein and fat.',
    allergyInfo: 'Peanut allergy occurs when the immune system mistakenly recognizes peanut proteins as a harmful threat. The body then releases substances such as histamine to fight it, causing various symptoms ranging from mild to severe. This condition is one of the most common causes of potentially life-threatening food allergic reactions (anaphylaxis).\n\nCases of peanut allergy are increasing, especially in children. Although previous reactions appeared mild, it is important to still consult with a medical professional because severe reactions can appear suddenly later in life.\n\nAllergy symptoms usually appear within a few minutes after consuming peanuts or their processed products. Symptoms can include itching, redness, or swelling of the skin, itching or tingling in the mouth and throat, digestive issues such as nausea, vomiting, and stomach cramps, as well as shortness of breath or nasal congestion.\n\nIn severe cases, peanut allergy can cause anaphylaxis, a severe reaction that causes swelling of the lips, tongue, and throat, difficulty breathing, drastically falling blood pressure, rapid pulse, dizziness, to loss of consciousness. This condition requires immediate treatment with an epinephrine autoinjector (EpiPen, Auvi-Q, and others) and emergency care at a hospital.\n\nAs a quick step, stop consuming peanuts when symptoms appear. For mild reactions, antihistamines can help relieve symptoms. However, if severe symptoms appear, use epinephrine immediately and seek medical attention. People with peanut allergies are advised to always carry emergency medication and inform those around them of their condition.',
    rarity: 'Common',
  },
  {
    id: 7,
    slug: 'pecan',
    name: 'Pecan',
    latinName: 'Carya illinoinensis',
    image: '/nuts/pecan.jpg',
    description: 'The pecan (Carya illinoinensis) is a nut and tree of the walnut family (Juglandaceae) native to temperate North America. Pecans have a rich and distinctive flavor and texture, and have the highest fat content among plant products and a caloric value approaching that of butter. Pecans can be eaten raw, sweetened, or salted. This nut is widely used in pastries, such as coffee cakes, and is often paired with chocolate. In the southeastern United States, pecan pie (made from pecans roasted in a clear custard batter) and pecan praline candies are traditional sweets.',
    allergyInfo: 'Pecan nut allergy is a form of food allergy that occurs when the immune system overreacts to proteins in pecans. This reaction can appear immediately after consuming it, and cause symptoms such as nasal congestion, itching, stomach pain, or respiratory issues. In some cases, this allergy can progress to anaphylaxis, a severe reaction that is potentially life-threatening.\n\nPeople with pecan allergies need to be careful with foods such as cereals, cookies, chocolates, and snacks that often contain pecans or their derivatives. If you experience allergy symptoms after consuming these foods, immediately consult a doctor or allergist. The doctor may perform a skin or blood test to confirm the diagnosis and determine the appropriate treatment steps.\n\nTreatment for pecan allergy generally includes avoiding allergens, taking antihistamines for mild symptoms, and oral immunotherapy to help lower the body\'s sensitivity to allergens in the long term. Seek medical attention immediately if severe symptoms such as difficulty breathing, facial swelling, or extreme dizziness appear.',
    rarity: 'Rare',
  },
  {
    id: 8,
    slug: 'pine-nut',
    name: 'Pine Nut',
    latinName: 'Pinus spp',
    image: '/nuts/pinenut.jpg',
    description: 'Pine nuts, small cream and ivory colored seeds—sometimes referred to as pine seeds and also sold as pignoli, pinyons, or piñons—have been prized for their delicious flavor since prehistoric times. The ancient Greeks and Romans knew and loved pine nuts; they were one of the foods archaeologists found in the ruins of Pompeii. Among several native tribes in California, an annual gathering feast in the Sierra Nevada Mountains traditionally marked the beginning of autumn, and today harvesting pine nuts is a major activity in national parks and public lands in the western mountainous region.',
    allergyInfo: 'Pine nut allergy occurs when the immune system reacts to proteins in pine nuts or foods containing them. This reaction can cause mild to severe symptoms, such as skin itching, stomach pain, or in rare cases, difficulty breathing and anaphylaxis.\n\nSymptoms that appear can vary in each person, but generally include:\n- Skin reaction: hives, redness, or itching.\n- Digestive issues: nausea, vomiting, diarrhea, or stomach cramps.\n- Respiratory issues: sneezing, coughing, runny nose, or wheezing.\n\nIf you suspect you have an allergy to pine nuts, you should avoid processed foods that might contain pine nuts, such as pesto, salads, or certain cakes. Immediately consult a doctor or allergist for further diagnosis and handling, especially if symptoms feel severe.',
    rarity: 'Legendary',
  },
  {
    id: 9,
    slug: 'pistachio',
    name: 'Pistachio',
    latinName: 'Pistacia vera',
    image: '/nuts/pistachio.jpg',
    description: 'The pistachio (Pistacia vera) is a small tree of the Anacardiaceae family (cashew family) and its edible seeds, grown in dry areas with a warm or temperate climate. Pistachio trees are believed to be native to Iran. This tree is grown widely from Afghanistan to the Mediterranean region and in California. Pistachio seeds can be eaten fresh or roasted and are often used in various desserts, including baklava, halvah, and ice cream. These seeds are also used as a greenish-yellow coloring in candies. Pistachio seeds are rich in protein, fat, dietary fiber, and vitamin B6.',
    allergyInfo: 'Pistachio allergy, like other nut allergies, occurs when the immune system mistakenly identifies proteins in pistachio as harmful substances. When someone who has this allergy consumes or touches pistachios, their body releases chemicals such as histamine that trigger an allergic reaction.\n\nCommon Pistachio Allergy Symptoms:\n- Skin reaction: itching, hives, or eczema after contact with pistachios.\n- Digestive issues: nausea, stomach cramps, vomiting, or diarrhea.\n- Respiratory symptoms: sneezing, nasal congestion, coughing, wheezing, or shortness of breath.\n- Anaphylaxis: in severe cases, a life-threatening allergic reaction can occur, such as difficulty breathing, drop in blood pressure, and loss of consciousness.\n\nQuick Handling:\nIf mild symptoms appear, immediately stop consuming pistachios and take antihistamines as directed. However, if signs of anaphylaxis appear, such as difficulty breathing or severe dizziness, use an epinephrine autoinjector (EpiPen) if available and immediately seek emergency medical help. For long-term prevention, consult a doctor or allergist to get an accurate diagnosis and safe food avoidance guidance.',
    rarity: 'Legendary',
  },
  {
    id: 10,
    slug: 'walnut',
    name: 'Walnut',
    latinName: 'Juglans regia',
    image: '/nuts/walnut.jpg',
    description: 'Walnuts (genus Juglans) are a genus of about 20 species of broad-leaved trees of the Juglandaceae family, which are native to North and South America, Southern Europe, Asia, and the Caribbean Islands. Walnut trees have long compound leaves with 5 to 23 short-stalked leaflets. Male and female reproductive organs are present on different clusters of petal-less flowers, known as catkins, on the same tree.',
    allergyInfo: 'Walnut allergy is divided into two main types, namely primary walnut allergy and secondary walnut allergy, which have different causes and symptom severity levels.\n\nIn primary walnut allergy, the allergic reaction is caused by IgE antibodies that react to proteins in walnuts that are resistant to heat and the digestion process. This type of allergy tends to cause more severe reactions, including anaphylaxis — a severe allergic reaction that can be life-threatening. Children with primary walnut allergy usually require an epinephrine (adrenaline) autoinjector as part of their allergy management plan, accompanied by the use of antihistamines to relieve mild symptoms.\n\nMeanwhile, in secondary walnut allergy, the allergic reaction arises due to IgE antibodies recognizing proteins in walnuts that are similar to proteins in tree pollen. This often occurs in individuals who have tree pollen allergies, where the body experiences cross-reactivity between pollen and walnut protein. This type of allergy is generally milder, often only causing symptoms in the mouth or face area, and is also known as Oral Allergy Syndrome (OAS). Handling is usually enough with antihistamines to reduce itching and discomfort.\n\nPrimary Walnut Allergy Symptoms:\n- Itching of the mouth, throat, eyes, ears, or skin\n- Hives (local or generalized)\n- Swelling of the lips, tongue, or face (angioedema)\n- Difficulty swallowing or hoarseness\n- Nasal congestion, sneezing, or runny nose\n- Nausea, vomiting, or abdominal discomfort\n- Coughing, wheezing, or shortness of breath\n- Pale, weak, or loss of consciousness (in severe cases)\n\nSecondary Walnut Allergy Symptoms:\n- Itching of the mouth, tongue, or ears\n- Itchy throat or mild cough\n- Hives around the mouth\n- Mild swelling of the lips or face\n- Mild nausea or stomach discomfort\n\nIf you suspect a walnut allergy, immediately consult a medical professional or allergist for an accurate diagnosis and handling, as the severity of reactions can differ in each individual.',
    rarity: 'Rare',
  },
  {
    id: 11,
    slug: 'buncis',
    name: 'Buncis',
    latinName: 'Phaseolus vulgaris',
    image: '/nuts/buncis.png',
    description: 'Buncis, known in English as green beans or French beans, are the unripe fruit and protective pods of various cultivars of the common bean (Phaseolus vulgaris). Originally native to the Americas, they are now grown and consumed around the world. Buncis pods are harvested young before the seeds inside fully mature, giving them their characteristic tender, crisp texture. They are a popular vegetable in Indonesian cuisine, commonly stir-fried, added to soups, or eaten raw in salads. Green beans are a good source of dietary fiber, vitamins C and K, folate, and manganese.',
    allergyInfo: 'Allergy to green beans (buncis) is relatively uncommon but possible, especially in people with existing legume allergies. The allergic reaction is caused by the immune system reacting to proteins in the bean pods or seeds.\n\nSymptoms of green bean allergy may include:\n- Itching or tingling in the mouth and throat\n- Skin hives or redness\n- Stomach cramps, nausea, or bloating\n- Runny nose or watery eyes\n- In rare cases, difficulty breathing or anaphylaxis\n\nCross-reactivity is possible with other legumes such as soybeans, peas, and peanuts. If you have a known legume allergy, approach buncis with caution.\n\nQuick Handling:\nFor mild reactions, stop consumption immediately and take antihistamines. For severe symptoms such as swelling of the throat or difficulty breathing, use an epinephrine auto-injector if available and seek emergency medical help immediately.',
    rarity: 'Common',
  },
  {
    id: 12,
    slug: 'kacang-hijau',
    name: 'Kacang Hijau',
    latinName: 'Vigna radiata',
    image: '/nuts/kacang_hijau.jpg',
    description: 'Kacang hijau, or mung bean (Vigna radiata), is a plant species in the legume family Fabaceae. It is native to the Indian subcontinent and has been cultivated in South, Southeast, and East Asia for thousands of years. Mung beans are small, oval-shaped, and bright green in color. They are widely consumed across Asia and are a staple ingredient in Indonesian cuisine, used in porridge (bubur kacang hijau), sweets, and savory dishes. When sprouted, the beans become bean sprouts (tauge), a common ingredient in stir-fries and soups. Mung beans are rich in protein, dietary fiber, folate, iron, magnesium, and antioxidants.',
    allergyInfo: 'Mung bean allergy is uncommon but has been reported, particularly in individuals with sensitivities to legumes. The proteins in mung beans can trigger immune responses in susceptible people.\n\nSymptoms may include:\n- Oral allergy syndrome: itching or tingling in the mouth shortly after eating\n- Skin reactions: hives, redness, or eczema\n- Gastrointestinal issues: nausea, bloating, gas, diarrhea, or stomach cramps\n- Respiratory symptoms: sneezing, nasal congestion, or wheezing\n- Anaphylaxis in rare, severe cases\n\nMung beans may cross-react with other legumes including soybeans, lentils, and chickpeas.\n\nQuick Handling:\nDiscontinue consumption immediately if allergic symptoms appear. Antihistamines may relieve mild symptoms. For severe reactions including throat swelling or difficulty breathing, seek emergency medical care immediately.',
    rarity: 'Common',
  },
  {
    id: 13,
    slug: 'kacang-hitam',
    name: 'Kacang Hitam',
    latinName: 'Phaseolus vulgaris var. melanotus',
    image: '/nuts/kacang_hitam.jpg',
    description: 'Kacang hitam, or black bean, is a variety of the common bean (Phaseolus vulgaris) with a distinctive shiny black seed coat. It is native to the Americas and is now widely cultivated in tropical and subtropical regions worldwide, including Indonesia. Black beans have a dense, meaty texture and a mildly sweet, earthy flavor, making them popular in soups, stews, rice dishes, and salads. In Indonesian cooking, they are often used in traditional sweet porridge and savory preparations. Nutritionally, black beans are an excellent source of plant-based protein, dietary fiber, iron, folate, magnesium, and antioxidant anthocyanins responsible for their dark pigment.',
    allergyInfo: 'Black bean allergy, while uncommon, occurs as part of legume hypersensitivity. The immune system reacts to specific seed storage proteins found in Phaseolus vulgaris varieties.\n\nAllergy symptoms can include:\n- Oral itching or tingling immediately after eating\n- Hives, skin redness, or swelling\n- Abdominal pain, diarrhea, nausea, or vomiting\n- Sneezing, runny nose, or shortness of breath\n- Severe cases: anaphylactic shock with throat swelling, drop in blood pressure, and loss of consciousness\n\nCross-reactivity with other common beans, kidney beans, and soybeans is possible.\n\nQuick Handling:\nStop consuming immediately if any reaction is noticed. For mild symptoms, antihistamines can help. For severe reactions, use an epinephrine auto-injector (EpiPen) if prescribed and call emergency services. Consult an allergist for formal testing and long-term dietary guidance.',
    rarity: 'Uncommon',
  },
  {
    id: 14,
    slug: 'kacang-kapri',
    name: 'Kacang Kapri',
    latinName: 'Pisum sativum',
    image: '/nuts/kacang_kapri.jpg',
    description: 'Kacang kapri, known as garden pea or snow pea (Pisum sativum), is a cool-season legume vegetable that has been cultivated since ancient times. It originated in the Mediterranean basin and the Middle East, and has been a dietary staple in many cultures. In Indonesia, kacang kapri refers primarily to the flat-podded snow pea variety, harvested before the seeds fully mature. The pods are tender, crisp, and mildly sweet, commonly used in stir-fries, soups, and salads. Peas are nutritionally rich, containing protein, dietary fiber, vitamin C, vitamin K, thiamine, folate, and manganese.',
    allergyInfo: 'Pea allergy is a form of legume allergy and can occur in people who are also sensitive to other legumes. The main allergenic proteins in peas include albumins and globulins (particularly vicilin and legumin).\n\nSymptoms of pea allergy include:\n- Itching or tingling in the mouth (oral allergy syndrome)\n- Skin rashes, hives, or angioedema (swelling under the skin)\n- Runny nose, sneezing, or watery eyes\n- Nausea, vomiting, or diarrhea\n- Difficulty breathing or wheezing\n- Anaphylaxis in severe cases\n\nPeas may cross-react with peanuts, soybeans, and other legumes. People with existing legume allergies should be particularly careful.\n\nQuick Handling:\nImmediately stop eating if an allergy is suspected. Use antihistamines for mild symptoms. For severe allergic reactions, administer epinephrine (EpiPen) if available and call emergency services. An allergist can confirm the diagnosis through skin prick or blood tests.',
    rarity: 'Uncommon',
  },
  {
    id: 15,
    slug: 'kacang-merah',
    name: 'Kacang Merah',
    latinName: 'Phaseolus vulgaris var. kidney',
    image: '/nuts/kacang_merah.jpg',
    description: 'Kacang merah, or red kidney bean (Phaseolus vulgaris), is one of the most recognizable and widely consumed legumes in the world. Named for its distinctive kidney shape and deep red color, it is a variety of the common bean native to Mesoamerica. In Indonesia, kacang merah is a popular ingredient in soups, stews, porridge, and traditional desserts such as es kacang merah (red bean ice). It is highly nutritious, providing excellent amounts of plant-based protein, complex carbohydrates, dietary fiber, iron, potassium, folate, and polyphenol antioxidants. Red kidney beans must always be cooked thoroughly, as raw or undercooked beans contain the toxic lectin phytohaemagglutinin.',
    allergyInfo: 'Red kidney bean allergy is a form of legume allergy. Additionally, consuming undercooked kidney beans can cause a toxic reaction due to high lectin (phytohaemagglutinin) content, which is distinct from an allergy but equally serious.\n\nAllergic symptoms may include:\n- Oral itching or swelling after eating\n- Skin hives or flushing\n- Stomach cramps, bloating, nausea, vomiting, or diarrhea\n- Sneezing or nasal congestion\n- In rare cases, anaphylaxis with throat closure and drop in blood pressure\n\nLectin Toxicity (from undercooked beans) symptoms:\n- Nausea, vomiting, and diarrhea within 1–3 hours of consumption\n- Abdominal pain and extreme discomfort\n\nQuick Handling:\nAlways boil kidney beans for at least 10 minutes before eating. For true allergic reactions, stop eating immediately, use antihistamines for mild symptoms, and seek emergency care for severe reactions.',
    rarity: 'Common',
  },
  {
    id: 16,
    slug: 'kacang-panjang',
    name: 'Kacang Panjang',
    latinName: 'Vigna unguiculata subsp. sesquipedalis',
    image: '/nuts/kacang_panjang.png',
    description: 'Kacang panjang, commonly known as yard-long bean, asparagus bean, or Chinese long bean, is a legume cultivar of Vigna unguiculata native to South and Southeast Asia. The pods can grow exceptionally long, often reaching 30–90 cm, which gives it the name "yard-long." It is one of the most popular vegetables in Indonesian cuisine, used in stir-fries (tumis kacang panjang), pecel sauce dishes, gado-gado, and sayur lodeh. The pods are harvested young when tender and have a slightly chewy texture with a mild, slightly grassy flavor. Nutritionally, kacang panjang provides good amounts of protein, dietary fiber, vitamins A, C, and K, as well as iron and calcium.',
    allergyInfo: 'Yard-long bean allergy is rare but possible, particularly in individuals with sensitivities to other Vigna species or broader legume allergies.\n\nPossible allergy symptoms:\n- Mild oral itching or tingling after eating raw pods\n- Skin redness or mild hives\n- Stomach discomfort, bloating, or gas\n- In people with broad legume allergy: more significant reactions including hives, swelling, or breathing difficulty\n\nCross-reactivity may occur with mung beans (kacang hijau), cowpeas, and black-eyed peas, which are all in the Vigna genus.\n\nQuick Handling:\nMild reactions can be managed by stopping consumption and taking antihistamines. Cooking the beans thoroughly can reduce some allergenic proteins. For any severe symptoms, seek medical attention promptly.',
    rarity: 'Common',
  },
  {
    id: 17,
    slug: 'kacang-pili',
    name: 'Kacang Pili',
    latinName: 'Canarium ovatum',
    image: '/nuts/kacang_pili.jpg',
    description: 'Kacang pili, or pili nut (Canarium ovatum), is an edible nut produced by the tropical pili tree, which is native to Maritime Southeast Asia, particularly the Philippines and parts of Indonesia and Papua New Guinea. Pili nuts are elongated, with a hard, dark brown shell enclosing a rich, buttery, cream-colored kernel. They are considered one of the most nutritious nuts available, containing a very high concentration of healthy fats (similar to macadamia nuts), high-quality protein, dietary fiber, and minerals including magnesium, potassium, phosphorus, and calcium. The nuts can be eaten raw, roasted, salted, or used in confectionery and baked goods.',
    allergyInfo: 'Pili nut allergy, while uncommon due to the nut\'s relatively limited global distribution, is a type of tree nut allergy. Like other tree nut allergies, reactions can range from mild to life-threatening.\n\nSymptoms of pili nut allergy may include:\n- Itching, tingling, or swelling in the mouth or throat (oral allergy syndrome)\n- Skin hives, redness, or swelling\n- Nausea, abdominal pain, vomiting, or diarrhea\n- Runny nose, sneezing, or nasal congestion\n- Difficulty breathing, wheezing, or asthma exacerbation\n- Severe cases: anaphylaxis with rapid heartbeat, drop in blood pressure, and loss of consciousness\n\nCross-reactivity with other tree nuts such as cashews, almonds, or macadamia is possible.\n\nQuick Handling:\nStop consuming pili nuts immediately if any reaction occurs. Take antihistamines for mild symptoms. For anaphylaxis, administer epinephrine (EpiPen) immediately and call emergency services. Individuals with known tree nut allergies should consult an allergist before trying pili nuts for the first time.',
    rarity: 'Mythic',
  },
  {
    id: 18,
    slug: 'kedelai',
    name: 'Kedelai',
    latinName: 'Glycine max',
    image: '/nuts/kedelai.png',
    description: 'Kedelai, or soybean (Glycine max), is a species of legume native to East Asia, widely grown for its edible bean. It is one of the most economically important crops in the world and a major source of plant-based protein and oil. In Indonesia, kedelai is the fundamental ingredient in many dietary staples including tempe (fermented soybean cake), tahu (tofu), kecap (soy sauce), and various traditional foods. Soybeans are nutritional powerhouses, providing complete protein containing all essential amino acids, dietary fiber, calcium, iron, magnesium, phosphorus, potassium, and isoflavones (plant compounds with potential health benefits). Global soybean production is dominated by the United States, Brazil, and Argentina.',
    allergyInfo: 'Soy allergy is one of the most common food allergies worldwide and is recognized as one of the "Big 9" major food allergens. It is especially prevalent in infants and young children, though many children outgrow it. The immune system reacts to proteins in soybeans, triggering an immune response.\n\nCommon soy allergy symptoms:\n- Skin reactions: hives, itching, eczema, or flushing\n- Digestive symptoms: nausea, stomach cramps, diarrhea, or vomiting\n- Oral allergy syndrome: itching or tingling in the mouth\n- Respiratory symptoms: runny nose, sneezing, asthma, or wheezing\n- Anaphylaxis in severe cases (less common than with peanut allergy but possible)\n\nSoy is found in an enormous range of processed foods including tofu, tempeh, soy sauce, edamame, soy milk, miso, and many processed snacks and baked goods. Always read labels carefully.\n\nQuick Handling:\nFor mild reactions, take antihistamines and avoid all soy-containing products. For severe reactions including throat swelling or anaphylaxis, use an epinephrine auto-injector immediately and call emergency services. Consult an allergist for a comprehensive soy-free diet plan.',
    rarity: 'Common',
  },
  {
    id: 19,
    slug: 'koro',
    name: 'Koro',
    latinName: 'Canavalia ensiformis',
    image: '/nuts/koro.png',
    description: 'Koro, or jack bean (Canavalia ensiformis), is a tropical legume originating from Central America and the Caribbean, now grown throughout tropical Africa, Asia, and the Pacific, including Indonesia. The plant produces large, white or buff-colored seeds inside long, flattened pods. In Indonesia, koro is grown as a food crop and nitrogen-fixing cover crop. The mature seeds are used after thorough cooking and processing to remove naturally occurring antinutrients, particularly concanavalin A (a lectin) and canavaine (a non-protein amino acid). When properly prepared, koro is used in traditional Indonesian foods such as keripik koro (koro chips) and as a protein-rich ingredient in tempeh substitutes. Koro beans are high in protein, carbohydrates, and dietary fiber.',
    allergyInfo: 'Koro (jack bean) allergy is rare but the bean contains several naturally occurring toxic compounds that make safe preparation critically important.\n\nNatural toxins in raw koro:\n- Concanavalin A (Con A): a lectin that can cause red blood cell agglutination and gastrointestinal distress\n- Canavaine: a non-protein amino acid that can interfere with arginine metabolism and cause toxic effects\n- These compounds are significantly reduced or eliminated by prolonged soaking (12–24 hours with water changes) and thorough boiling\n\nAllergic reaction symptoms (in sensitized individuals):\n- Itching or tingling in the mouth and throat\n- Skin hives or swelling\n- Nausea, vomiting, abdominal pain, or diarrhea\n- Respiratory discomfort\n\nToxicity symptoms (from undercooked beans):\n- Severe nausea and vomiting within hours of eating\n- Diarrhea and extreme abdominal cramping\n\nQuick Handling:\nAlways soak and boil koro beans thoroughly before consumption. Never eat raw or undercooked koro. For allergic reactions, stop eating, use antihistamines for mild symptoms, and seek emergency care for severe reactions. Consult a doctor before introducing koro into the diet if you have legume sensitivities.',
    rarity: 'Mythic',
  },
  {
    id: 99,
    slug: 'secret-wowok-nut',
    name: 'Wowok Nut',
    latinName: 'Wowokus secretus',
    image: '/nuts/prabowo.jpg',
    description: 'There are reports claiming that the MBG program is “poisoning” the children… AND he also said that people in Sawit Villages don’t use dollars',
    allergyInfo: 'He seems to have a strong aversion to foreigners and has a chant: “HEY, ANTEK ANTEK ASING!”',
    rarity: 'Mitos',
  }
];


// Helper functions for easy access
export const getAllNuts = (): NutData[] => nutsData;

export const getNutById = (id: number): NutData | undefined => {
  return nutsData.find((nut) => nut.id === id);
};

export const getNutByName = (name: string): NutData | undefined => {
  const cleanName = name.toLowerCase().trim();
  // Try exact match
  let found = nutsData.find((nut) => nut.name.toLowerCase() === cleanName);
  if (found) return found;

  // Try singular form if it ends in 's'
  if (cleanName.endsWith('s')) {
    const singular = cleanName.slice(0, -1);
    found = nutsData.find((nut) => nut.name.toLowerCase() === singular);
    if (found) return found;
  }

  // Try partial match (if local name is inside AI name, e.g., "Brazil Nut" in "Shelled Brazil Nut")
  found = nutsData.find((nut) => cleanName.includes(nut.name.toLowerCase()));
  if (found) return found;

  return undefined;
};

export const getNutBySlug = (slug: string): NutData | undefined => {
  return nutsData.find((nut) => nut.slug === slug);
};
