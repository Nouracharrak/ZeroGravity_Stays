import React from 'react'
import Navbar from '../componenets/Navbar'
import Slide from '../componenets/Slide'
import Categories from '../componenets/Categories'
import Listings from '../componenets/Listings'
import Footer from '../componenets/Footer'

const HomePage = () => {
  return (
    <>
    <Navbar/>
    <Slide/>
    <Categories/>
    <Listings/>
    <Footer/>
    </>
  )
}

export default HomePage
