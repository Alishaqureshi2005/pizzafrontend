import React from 'react'
import Onbestlist from '../components/Onbestlist'
import pizza from '../assets/slice-crispy-pizza-with-meat-cheese (2).jpg'
const BestOnlineService = () => {
  let box = [
    {
      cargateray: "Pizza's",
      cargateraycontent: "verscheidenheid aan pizza's in kleine en grote maten",
      menulist: [
        {
          tittle: "MARGIRITA#1",
          img:pizza,
          content: "Tomatensaus, kaas",
          price: "€8.95"
        },
        {
          tittle: "FUNGHI#2",
          img:pizza,
          content: "Tomatensaus, kaas, champignons",
          price: "€8.95"
        },
        {
          tittle: "PROSCUITTO#3",
          img:pizza,
          content: "Tomatensaus, kaas, ham",
          price: "€8.95"
        },
        {
          tittle: "SALAMI#4",
        
          content: "Tomatensaus, kaas, salami",
          price: "€8.95"
        },
      
        {
          tittle: "BOLOGNAISE#5",
          content: "  Bolognaise, kaas, look",
          price: "€8.95"
        },
        {
          tittle: "TONNO#6",
          content: " Tomatensaus, kaas, tonijn, ui, olijven",
          price: "€8.95"
        },
        {
          tittle: " VEGETARISCH #7",
          content: " Tomatensaus, kaas, paprika, champignons, mais, ui, olijven",
          price: "€8.95"
        },
        {
          tittle: "QUATTRO FROMAGGIO #8",
          content: " Tomatensaus, kaas, vier soorten kaas",
          price: "€8.95"
        },
        {
          tittle: "PEPPERONI #9",
          content: "Tomatensaus, kaas, pepperoni, maïs pikante pepers",
          price: "€8.95"
        },
        {
          tittle: "MIMOSA #10",
          content: "Tomatensaus, kaas, ham, tomaat",
          price: "€8.95"
        },
        {
          tittle: "KEBAB #11",
          content: " Tomatensaus, kaas, kebab",
          price: "€8.95"
        },
        {
          tittle: "QUATTRO STAGIONE #12",
          content: "Tomatensaus, kaas, champignons, paprika, salami, ham  ",
          price: "€9.95"
        },
        {
          tittle: " MARGARITA SPECIAAL #13",
          content: "Tomatensaus, kaas, look, ui, paprika, mozzarella kaas",
          price: "€9.95"
        },
        {
          tittle: "BOLOGNAISE SPECIAAL #14",
          content: "Bolognaise, look, ui, kaas, pikante peppers",
          price: "€9.95"
        },
        {
          tittle: " KEBAB SPECIAAL #15",
          content: "Tomatensaus, kaas, kebab, ui, paprika, look",
          price: "€9.95"
        },
        {
          tittle: " RUSTICA #16",
          content: " Tomatensaus, kaas, ham, salami, ei",
          price: "€9.95"
        },
        {
          tittle: "CALZONE #17",
          content: "  Tomatensaus, kaas, ham, salami, paprika, bolognaise",
          price: "€9.95"
        },
        {
          tittle: "BOLOGNAISE KIP #18",
          content: " bolognaisesaus, kaas, look, ui, kip",
          price: "€9.95"
        },
        {
          tittle: " POLLO #19",
          content: "Tomatensaus, kaas, kip, ui, champignons, paprika",
          price: "€10.95"
        },
        {
          tittle: "HAWAI #20",
          content: "  Tomatensaus, kaas, ham, kip, ananas, maïs",
          price: "€10.95"
        },
        {
          tittle:"BBQ KIP #21",
          content: "  Bbq saus, kaas, ui, paprika, kip",
          price: "€1p.95"
        },
        {
          tittle: "BBQ GEHAKT #22",
          content: " Bbq saus, kaas, ui, paprika, gehaktballetjes",
          price: "€10.95"
        },
        {
          tittle: " BBQ BACON. #23",
          content: " Bbq saus, kaas, ui, paprika, bacon, gehakt",
          price: "€10.95"
        },
        {
          tittle: " PIZZA MERGUEZZ #24",
          content: " Tomatensaus, kaas, ui, paprika, look, merguez, pikante pepers, bbq saus",
          price: "€10.95"
        },
        {
          tittle: "  HOT PIZZA #25",
          content: "Tomatensaus, kaas, peperoni, ui, paprika, pikante pepers",
          price: "€10.95"
        },
        {
          tittle: " ROOM VEGIE #26",
          content: "Roomsaus, kaas, champignons, ui, paprika, maïs, olijven ",
          price: "€10.95"
        },
        {
          tittle: "  ROOM BACON #27",
          content: "Roomsaus, kaas, bacon, ui, paprika",
          price: "€10.95"
        },
        {
          tittle: " ROOME KIP #28",
          content: " Roomsaus, kaas, paprika, ui, kip",
          price: "€10.95"
        },
        {
          tittle: " CURRY KIP #29",
          content: "Currysaus, kaas, ui, ananas, kip, mozzarella",
          price: "€10.95"
        },
        {
          tittle: " CURRY KEBAB #30",
          content: "Currysaus, kaas, ui, paprika, kebab, pikante pepers ",
          price: "€10.95"
        },
        {
          tittle: "CURRY VEGIE #31",
          content: "Currysaus, kaas, ui, champignons, paprika, maïs, olijven",
          price: "€10.95"
        },
        {
          tittle: " CURRY DELUXE #32",
          content: "Currysaus, kaas, ui, paprika, kip, gehaktballetjes",
          price: "€11.95"
        },
        {
          tittle: " TANDOORI #33",
          content: "Tomatensaus, kaas, ui, paprika, tandoori kip",
          price: "€11.95"
        },
        {
          tittle: " FRUTTI DI MARE #34",
          content: " Tomatensaus, kaas, tonijn, scampi's, garnalen, mosselen, calamares",
          price: "€11.95"
        },
        {
          tittle: "FULL OPTION #35",
          content: "Tomatensaus, kaas, ui, maïs, paprika, salami, bolognaise, kip, olijven",
          price: "€11.95"
        },
        {
          tittle: " PIZZA MIX #36",
          content: "Tomatensaus, kaas, pitta vlees, kip pikante pepers, ui, champignons",
          price: "€11.95"
        },
        {
          tittle: " BBQ SPECIAAL #37",
          content: "Bbq saus, kaas, pepperoni, ui, paprika, kip, gehaktballetjes",
          price: "€11.95"
        },
        {
          tittle: "  CURRY SPECIAAL #38",
          content: "Currysaus, kaas, ham, gehaktballetjes, ui, paprika, kip, mozzarella",
          price: "€11.95"
        },
        {
          tittle: "PIZZA SCAMPI’S #39",
          content: " Tomatensaus, kaas, ui, paprika, scampi's",
          price: "€11.95"
        },
        {
          tittle: "PIZZA HUSREV #40",
          content: " Tomatensaus, kaas, peperoni, salami, ham, paprika, gehaktballetjes, kip, olijven",
          price: "€11.95"
        },
      
      ]

    },
     {
      cargateray: "Pasta's",
      cargateraycontent: "we bieden een verscheidenheid aan pasta's, ontdek ons ​​menu",
      menulist: [

        {
          tittle: "PASTA BOLOGNAISE #42",
          img:pizza,
          content: "Bolognaisesaus, kaas",
          price: "€11.00"
        },
        {
          tittle: "PASTA FUNGI # 43",
          content: "Roomsaus, kaas, champignons",
          price: "€11.00"
        },
        {
          tittle: "PASTA CARBONARA # 44",
          content: "Roomsaus, kaas, spek, tomatensaus",
          price: "€11.00"
        },
        {
          tittle: "PASTA POLLO # 45",
          content: "Roomsaus, kaas, kip",
          price: "€11.00"
        },
      
        {
          tittle: "PASTA VEGETARIAN # 46",
          content: " Roomsaus, kaas, groenten",
          price: "€11.00"
        },
        {
          tittle: " PASTA QUATTRO FROMAGGIO # 47",
          content: "Roomsaus, vier soorten kaas",
          price: "€11.00"
        },
        {
          tittle: "PASTA DIABOLIQUE # 48",
          content: " Roomsaus, kaas, scampi's tomatensaus",
          price: "€12.00"
        },
        {
          tittle: "PASTA SPECIAL # 49",
          content: " Roomsaus, kaas, spek, kip, ei",
          price: "€12.00"
        },
        {
          tittle: "PASTA CHICKEN # 50",
          content: "Roomsaus, kaas, kip pesto",
          price: "€12.00"
        },
          {
          tittle: "PASTA CURRY # 51",
          content: "Roomsaus, ananas, maïs, ui, kip, gehaktballetjes, currysaus",
          price: "€12.00"
        },
        {
          tittle: "PASTA HUSREV # 52",
          content: "Roomsaus, ui, paprika, kip, gehaktballetjes,",
          price: "€12.00"
        },
        {
          tittle: "PASTA FRUTTI DI MARE # 53",
          content: "Roomsaus, tomatensaus, zeevruchten",
          price: "€12.00"
        },
        {
          tittle: "PASTA ROMANA # 54",
          content: "Roomsaus, kaas, kip, ui, champignons ",
          price: "€12.00"
        },
      ]
    },
         {
      cargateray: "Pitta Brood",
      cargateraycontent: "Turkse Kebab En Brood",
      menulist: [
        {
          
          tittle: "Schotel Pitta",
          content: "Brood, Pitta Vlees, Keuze Van saus en Groentjes",
          price: "€7.00"
        },
        {
          tittle: "Brood Kip",
          content: "Brood, Pitta Kip, Keuze Van saus en Groentjes",
          price: "€7.00"
        },
        {
          tittle: "Brood Mix",
          content: "Brood, Pitta Vlees en kip, Keuze Van saus en Salade",
          price: "€7.00"
        },
        {
          tittle: "VEGETARISCH Brood",
          content: "Brood, FetaKaas, Keuze Van saus en Groentjes",
          price: "€6.00"
        },
      ]},
          {
      cargateray: "Schotels",
      cargateraycontent: " Pitta Vlees, Frietjes, Keuze Van saus en Groentjes",
      menulist: [
        {
          tittle: "Schotel Pitta",
         
          content: "Brood, Pitta Vlees, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          tittle: "Schotel Kip",
          content: "Frietjes, Kip, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          tittle: "Schotel Mix",
          content: "Pitta Vlees en Kip, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          tittle: "Schotel Mexicano",
          content: "Mexicano, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
         {
          tittle: "Schotel Hamburger",
          content: "Hamburger, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          tittle: "Schotel Frikandel",
          content: "Frikandel, Frietjes, Keuze Van saus en Groentjes",
          price: "€11.00"
        },
        {
          tittle: "Schotel Vegetarisch",
          content: "Fetakaas, Frietjes, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
        {
          tittle: "Schotel Kipsate",
          content: "Kipsate, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
          {
          tittle: "Schotel Apirio",
          content: "Apirio, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          tittle: "Schotel Husrev",
          content: "Grill Kipfilet, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          tittle: "Schotel Kofte",
          content: "Kofte, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
        {
          tittle: "Schotel Adana",
          content: "Adana, Frietjes, Keuze Van saus en Groentjes",
          price: "€13.00"
        },
      ]},
      {
      cargateray: "Durum",
      
      menulist: [
        {
          tittle: "Durum Pitta",
          content: "Wrap, Vlees, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          tittle: "Durum Kip",
          content: "Wrap, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          tittle:"Durum Mix",
          content: "Wrap Vlees en Kip, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          tittle: "Durum Firkandel",
          content: "Wrap, Frikandel, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
         {
          tittle: "Durum Hamburger",
          content: "Wrap, Hamburger, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          tittle: "Durum Mexicano",
          content: "Wrap, Mexicano, Keuze Van saus en Groentjes",
          price: "€8.00"
        },
        {
          tittle: "Durum Kofte",
          content: "Wrap Kofte, Keuze Van saus en Groentjes",
          price: "€9.00"
        },
        {
          tittle: "Durum Adana",
          content: "Wrap, Adana, Keuze Van saus en Groentjes",
          price: "€9.00"
        },
          {
          tittle: "Durum Kipcorn",
          content: "Wrap, Kipcorn, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
         {
          tittle: "Durum Kipsate",
          content: "Wrap, Kipsate, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
        {
          tittle: "Durum Vegetarisch",
          content: "Wrap, Fetakaas, Frietjes, Keuze Van saus en Groentjes",
          price: "€10.00"
        },
      ]},
  ]
  
  

  return (

    <div className=' gird place-items-center bg-gray-200 p-10 w-full h-auto   '>
      <div className='w-full '>
        <div className='text-center space-y-5 mt-20 '>
          <h1 className='text-red-600 font-bold text-4xl mt-10'>Bestel online  service</h1>
          {/* <h1 className='text-4xl font-bold'></h1> */}
        </div>
        {/* oderlist */}
        <div className=' mt-10 px-4 py-6'>

   
          <div className='mt-10 space-y-2 text-center'>
            <h1 className='text-2xl font-bold'>Husrev Pitta Menu</h1>
            <h2>Selecteer elke sectie om te navigeren tussen voedselselectie.</h2>
          </div>
          <div className='mt-8'>
            {box.map((v, k) => { return (<div>
              <h1 className='text-xl text-black font-bold'>{v.cargateray}</h1>
              <p>{v.cargateraycontent}</p>
            <div className=' grid  md:grid-cols-1 lg:grid-cols-2  gap-5 mt-6 '>{v.menulist.map((menuv ,menuk)=>{return(<div className='bg-white/80 shadow-lg px-4 py-8 flex lg:flex-row flex-col-reverse items-center gap-1 justify-between'><Onbestlist tittle={menuv.tittle} content={menuv.content} price={menuv.price} imagesrc={menuv.img}/></div>)})}
            </div>
            </div>) })}
          </div>
      
        </div>





      </div>
    </div>
  )
}

export default BestOnlineService

