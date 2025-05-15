import React, { useState } from 'react';
import { FaSearch, FaShoppingCart, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import pizza from '../assets/slice-crispy-pizza-with-meat-cheese (2).jpg';
import { useCart } from '../context/CartContext';

const BestOnlineService = () => {
  const [activeCategory, setActiveCategory] = useState('Pizza\'s');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const { addToCart } = useCart();

  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const menuData = [
    {
      category: "Pizza's",
      description: "Verscheidenheid aan pizza's in kleine en grote maten",
      items: [
        {
          title: "MARGIRITA#1",
          img: pizza,
          content: "Tomatensaus, kaas",
          price: "€8.95"
        },
        {
          title: "FUNGHI#2",
          img: pizza,
          content: "Tomatensaus, kaas, champignons",
          price: "€8.95"
        },
        {
          title: "PROSCUITTO#3",
          img: pizza,
          content: "Tomatensaus, kaas, ham",
          price: "€8.95"
        },
        {
          title: "SALAMI#4",
          content: "Tomatensaus, kaas, salami",
          price: "€8.95"
        },
        {
          title: "BOLOGNAISE#5",
          content: "  Bolognaise, kaas, look",
          price: "€8.95"
        },
        {
          title: "TONNO#6",
          content: " Tomatensaus, kaas, tonijn, ui, olijven",
          price: "€8.95"
        },
        {
          title: " VEGETARISCH #7",
          content: " Tomatensaus, kaas, paprika, champignons, mais, ui, olijven",
          price: "€8.95"
        },
        {
          title: "QUATTRO FROMAGGIO #8",
          content: " Tomatensaus, kaas, vier soorten kaas",
          price: "€8.95"
        },
        {
          title: "PEPPERONI #9",
          content: "Tomatensaus, kaas, pepperoni, maïs pikante pepers",
          price: "€8.95"
        },
        {
          title: "MIMOSA #10",
          content: "Tomatensaus, kaas, ham, tomaat",
          price: "€8.95"
        },
        {
          title: "KEBAB #11",
          content: " Tomatensaus, kaas, kebab",
          price: "€8.95"
        },
        {
          title: "QUATTRO STAGIONE #12",
          content: "Tomatensaus, kaas, champignons, paprika, salami, ham  ",
          price: "€9.95"
        },
        {
          title: " MARGARITA SPECIAAL #13",
          content: "Tomatensaus, kaas, look, ui, paprika, mozzarella kaas",
          price: "€9.95"
        },
        {
          title: "BOLOGNAISE SPECIAAL #14",
          content: "Bolognaise, look, ui, kaas, pikante peppers",
          price: "€9.95"
        },
        {
          title: " KEBAB SPECIAAL #15",
          content: "Tomatensaus, kaas, kebab, ui, paprika, look",
          price: "€9.95"
        },
        {
          title: " RUSTICA #16",
          content: " Tomatensaus, kaas, ham, salami, ei",
          price: "€9.95"
        },
        {
          title: "CALZONE #17",
          content: "  Tomatensaus, kaas, ham, salami, paprika, bolognaise",
          price: "€9.95"
        },
        {
          title: "BOLOGNAISE KIP #18",
          content: " bolognaisesaus, kaas, look, ui, kip",
          price: "€9.95"
        },
        {
          title: " POLLO #19",
          content: "Tomatensaus, kaas, kip, ui, champignons, paprika",
          price: "€10.95"
        },
        {
          title: "HAWAI #20",
          content: "  Tomatensaus, kaas, ham, kip, ananas, maïs",
          price: "€10.95"
        },
        {
          title: "BBQ KIP #21",
          content: "  Bbq saus, kaas, ui, paprika, kip",
          price: "€1p.95"
        },
        {
          title: "BBQ GEHAKT #22",
          content: " Bbq saus, kaas, ui, paprika, gehaktballetjes",
          price: "€10.95"
        },
        {
          title: " BBQ BACON. #23",
          content: " Bbq saus, kaas, ui, paprika, bacon, gehakt",
          price: "€10.95"
        },
        {
          title: " PIZZA MERGUEZZ #24",
          content: " Tomatensaus, kaas, ui, paprika, look, merguez, pikante pepers, bbq saus",
          price: "€10.95"
        },
        {
          title: "  HOT PIZZA #25",
          content: "Tomatensaus, kaas, peperoni, ui, paprika, pikante pepers",
          price: "€10.95"
        },
        {
          title: " ROOM VEGIE #26",
          content: "Roomsaus, kaas, champignons, ui, paprika, maïs, olijven ",
          price: "€10.95"
        },
        {
          title: "  ROOM BACON #27",
          content: "Roomsaus, kaas, bacon, ui, paprika",
          price: "€10.95"
        },
        {
          title: " ROOME KIP #28",
          content: " Roomsaus, kaas, paprika, ui, kip",
          price: "€10.95"
        },
        {
          title: " CURRY KIP #29",
          content: "Currysaus, kaas, ui, ananas, kip, mozzarella",
          price: "€10.95"
        },
        {
          title: " CURRY KEBAB #30",
          content: "Currysaus, kaas, ui, paprika, kebab, pikante pepers ",
          price: "€10.95"
        },
        {
          title: "CURRY VEGIE #31",
          content: "Currysaus, kaas, ui, champignons, paprika, maïs, olijven",
          price: "€10.95"
        },
        {
          title: " CURRY DELUXE #32",
          content: "Currysaus, kaas, ui, paprika, kip, gehaktballetjes",
          price: "€11.95"
        },
        {
          title: " TANDOORI #33",
          content: "Tomatensaus, kaas, ui, paprika, tandoori kip",
          price: "€11.95"
        },
        {
          title: " FRUTTI DI MARE #34",
          content: " Tomatensaus, kaas, tonijn, scampi's, garnalen, mosselen, calamares",
          price: "€11.95"
        },
        {
          title: "FULL OPTION #35",
          content: "Tomatensaus, kaas, ui, maïs, paprika, salami, bolognaise, kip, olijven",
          price: "€11.95"
        },
        {
          title: " PIZZA MIX #36",
          content: "Tomatensaus, kaas, pitta vlees, kip pikante pepers, ui, champignons",
          price: "€11.95"
        },
        {
          title: " BBQ SPECIAAL #37",
          content: "Bbq saus, kaas, pepperoni, ui, paprika, kip, gehaktballetjes",
          price: "€11.95"
        },
        {
          title: "  CURRY SPECIAAL #38",
          content: "Currysaus, kaas, ham, gehaktballetjes, ui, paprika, kip, mozzarella",
          price: "€11.95"
        },
        {
          title: "PIZZA SCAMPI'S #39",
          content: " Tomatensaus, kaas, ui, paprika, scampi's",
          price: "€11.95"
        },
        {
          title: "PIZZA HUSREV #40",
          content: " Tomatensaus, kaas, peperoni, salami, ham, paprika, gehaktballetjes, kip, olijven",
          price: "€11.95"
        },
      ]
    },
    {
      category: "Pasta's",
      description: "We bieden een verscheidenheid aan pasta's, ontdek ons menu",
      items: [
        {
          title: "PASTA BOLOGNAISE #42",
          img: pizza,
          content: "Bolognaisesaus, kaas",
          price: "€11.00"
        },
        {
          title: "PASTA FUNGI # 43",
          content: "Roomsaus, kaas, champignons",
          price: "€11.00"
        },
        {
          title: "PASTA CARBONARA # 44",
          content: "Roomsaus, kaas, spek, tomatensaus",
          price: "€11.00"
        },
        {
          title: "PASTA POLLO # 45",
          content: "Roomsaus, kaas, kip",
          price: "€11.00"
        },
        {
          title: "PASTA VEGETARIAN # 46",
          content: " Roomsaus, kaas, groenten",
          price: "€11.00"
        },
        {
          title: " PASTA QUATTRO FROMAGGIO # 47",
          content: "Roomsaus, vier soorten kaas",
          price: "€11.00"
        },
        {
          title: "PASTA DIABOLIQUE # 48",
          content: " Roomsaus, kaas, scampi's tomatensaus",
          price: "€12.00"
        },
        {
          title: "PASTA SPECIAL # 49",
          content: " Roomsaus, kaas, spek, kip, ei",
          price: "€12.00"
        },
        {
          title: "PASTA CHICKEN # 50",
          content: "Roomsaus, kaas, kip pesto",
          price: "€12.00"
        },
        {
          title: "PASTA CURRY # 51",
          content: "Roomsaus, ananas, maïs, ui, kip, gehaktballetjes, currysaus",
          price: "€12.00"
        },
        {
          title: "PASTA HUSREV # 52",
          content: "Roomsaus, ui, paprika, kip, gehaktballetjes,",
          price: "€12.00"
        },
        {
          title: "PASTA FRUTTI DI MARE # 53",
          content: "Roomsaus, tomatensaus, zeevruchten",
          price: "€12.00"
        },
        {
          title: "PASTA ROMANA # 54",
          content: "Roomsaus, kaas, kip, ui, champignons ",
          price: "€12.00"
        },
      ]
    },
    {
      category: "Pitta Brood",
      description: "Turkse Kebab En Brood",
      items: [
        {
          title: "Schotel Pitta",
          content: "Brood, Pitta Vlees, Keuze Van saus en Groentjes",
          price: "€7.00"
        },
        {
          title: "Brood Kip",
          content: "Brood, Pitta Kip, Keuze Van saus en Groentjes",
          price: "€7.00"
        },
        {
          title: "Brood Mix",
          content: "Brood, Pitta Vlees en kip, Keuze Van saus en Salade",
          price: "€7.00"
        },
        {
          title: "VEGETARISCH Brood",
          content: "Brood, FetaKaas, Keuze Van saus en Groentjes",
          price: "€6.00"
        },
      ]
    },
    {
      category: "Schotels",
      description: "Pitta Vlees, Frietjes, Keuze Van saus en Groentjes",
      items: [
        {
          title: "Schotel Pitta",
          content: "Brood, Pitta Vlees, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Kip",
          content: "Frietjes, Kip, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Mix",
          content: "Pitta Vlees en Kip, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Mexicano",
          content: "Mexicano, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Hamburger",
          content: "Hamburger, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Frikandel",
          content: "Frikandel, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          title: "Schotel Vegetarisch",
          content: "Fetakaas, Frietjes, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
        {
          title: "Schotel Kipsate",
          content: "Kipsate, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          title: "Schotel Apirio",
          content: "Apirio, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          title: "Schotel Husrev",
          content: "Grill Kipfilet, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          title: "Schotel Kofte",
          content: "Kofte, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          title: "Schotel Adana",
          content: "Adana, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
      ]
    },
    {
      category: "Durum",
      description: "Heerlijke wraps met verschillende vullingen",
      items: [
        {
          title: "Durum Pitta",
          content: "Wrap, Vlees, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Kip",
          content: "Wrap, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Mix",
          content: "Wrap Vlees en Kip, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Firkandel",
          content: "Wrap, Frikandel, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Hamburger",
          content: "Wrap, Hamburger, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Mexicano",
          content: "Wrap, Mexicano, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          title: "Durum Kofte",
          content: "Wrap Kofte, Keuze Van saus en Groentjes",
          price: "€9.00"
        },
        {
          title: "Durum Adana",
          content: "Wrap, Adana, Keuze Van saus en Groentjes",
          price: "€9.00"
        },
        {
          title: "Durum Kipcorn",
          content: "Wrap, Kipcorn, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
        {
          title: "Durum Kipsate",
          content: "Wrap, Kipsate, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
        {
          title: "Durum Vegetarisch",
          content: "Wrap, Fetakaas, Frietjes, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
      ]
    }
  ];

  const filteredMenuData = menuData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleAddToCart = (item) => {
    addToCart({
      id: item.title, // Using title as ID since there's no explicit ID
      title: item.title,
      content: item.content,
      price: parseFloat(item.price.replace('€', '')),
      image: item.img
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Bestel Online Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ontdek ons heerlijke menu en bestel direct online. Snelle service en verse ingrediënten!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Zoek in het menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {menuData.map((category) => (
            <button
              key={category.category}
              onClick={() => setActiveCategory(category.category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === category.category
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-red-50'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {filteredMenuData.map((section) => (
            <div key={section.category} className="bg-white rounded-xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full px-6 py-4 flex items-center justify-between bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <div>
                  <h2 className="text-xl font-semibold">{section.category}</h2>
                  <p className="text-sm text-red-100">{section.description}</p>
                </div>
                {expandedSections[section.category] ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {expandedSections[section.category] && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {item.img && (
                          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{item.content}</p>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <FaShoppingCart />
                          Bestellen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMenuData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Geen items gevonden die overeenkomen met je zoekopdracht.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestOnlineService;

