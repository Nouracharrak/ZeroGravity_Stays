import "../styles/footer.scss"
import { LocalPhone, Email } from "@mui/icons-material"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_left">
        <a href="/"><img src="/assets/logo.jpg" alt="logo" /></a>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/terms">Terms and Conditions</Link></li>
          <li><Link to="/refund-policy">Return and Refund Policy</Link></li>
          <li><Link to="/contact">Contact Us</Link></li> {/* Nouvelle ligne */}
        </ul>
      </div>

      <div className="footer_right">
        <h3>Contact Us</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>+33629200522</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>SpaceHotel@support.com</p>
        </div>
        <div className="footer_right_button">
          <Link to="/contact" className="contact-button">Contact Us</Link>
        </div>
        <img src="/assets/payment.png" alt="payment" />
      </div>
    </div>
  )
}

export default Footer

