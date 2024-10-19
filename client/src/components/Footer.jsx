import React from 'react'
import "../styles/Footer.scss"
import {LocationOn,LocalPhone,Email} from "@mui/icons-material"

const Footer = () => {
  return (
    <div className='footer'>
        <div className='footer_left'>
            <a href="/"><img src='/assets/logo.webp' alt='logo'/></a>
        </div>
        <div className='footer_center'>
            <h3>Useful Links</h3>
            <ul>
                <li>About Us</li>
                <li>Term and Conditions</li>
                <li>return and refund Policy</li>
            </ul>
        </div>
        <div className='footer_right'>
            <h3>Contact</h3>
            <div className='footer_right_info'>
                <LocalPhone/>
                <p>017 234 123 11</p>


                

            </div>
            <div className='footer_right_info'>
                <Email/>
                <p>shakib@gmail.com</p>
                

                

            </div>
           <img src="/assets/payment.png" alt='payment'/>
        </div>
      
    </div>
  )
}

export default Footer
