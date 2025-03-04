import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/contact.scss";
import URL from "../constants/api";

function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Log URL for debugging
  useEffect(() => {
    console.log("Backend URL:", URL.BACK_LINK);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = `${URL.BACK_LINK}/contact`;
      console.log("Sending request to:", apiUrl);
      console.log("Data being sent:", formData);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      // Get response text first before attempting to parse as JSON
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse the response as JSON only if there is content
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
          console.log("Parsed response data:", data);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          throw new Error(
            "The server returned an invalid response. Please try again later or contact support."
          );
        }
      } else {
        console.warn("Empty response received from server");
        throw new Error("No response received from server. Please try again.");
      }

      if (!response.ok) {
        throw new Error(
          (data && data.message) ||
            `Request failed with status ${response.status}`
        );
      }

      setSubmitSuccess(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending contact message:", error);
      setSubmitError(
        error.message ||
          "An error occurred while sending your message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact_content">
        {submitSuccess ? (
         <div className="contact_success">
         <h2>Thank You!</h2>
         <p>Your message has been sent successfully.</p>
         <div className="button-container">
           <button
             className="btn-secondary"
             onClick={() => setSubmitSuccess(false)}
           >
             Send Another Message
           </button>
           <button
             className="btn-primary"
             onClick={() => navigate('/')}
           >
             Go to Home
           </button>
         </div>
       </div>   
        ) : (
          <>
            <h2>Contact Us</h2>
            <p>
              Have questions or need assistance? Fill out the form below and
              we'll get back to you shortly.
            </p>

            {submitError && <div className="error-message">{submitError}</div>}

            <form className="contact_content_form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "error" : ""}
                  />
                  {errors.firstName && (
                    <div className="error-text">{errors.firstName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "error" : ""}
                  />
                  {errors.lastName && (
                    <div className="error-text">{errors.lastName}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <div className="error-text">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? "error" : ""}
                ></textarea>
                {errors.message && (
                  <div className="error-text">{errors.message}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={isSubmitting ? "submitting" : ""}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Contact;
