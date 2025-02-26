import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/register.scss";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImage: null
    });

    const [passwordMatch, setPasswordMatch] = useState(true);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (name === "confirmPassword") {
            setPasswordMatch(formData.password === value);
        } else if (name === "password") {
            setPasswordMatch(formData.confirmPassword === value || formData.confirmPassword === "");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const register_form = new FormData();
            for (var key in formData) {
                register_form.append(key, formData[key]);
            }

            const response = await fetch("https://zero-gravity-stays.vercel.app/auth/register", {
                method: "POST",
                body: register_form
            });

            if (response.ok) {
                navigate("/login");
            } else {
                console.log("registration failed", response.statusText);
            }
        } catch (err) {
            console.log("registration failed", err.message);
        }
    };

    return (
        <div className="register">
            <div className="register_content">
                <form className="register_content_form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                    />
                    {formData.password !== "" && formData.confirmPassword !== "" && formData.password !== formData.confirmPassword && (
                        <p style={{ color: "red" }}>Passwords are not a match</p>
                    )}
                    <input
                        id="image"
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <label htmlFor="image">
                        <img src="/assets/addImage.png" alt="addPicture" />
                        <p style={{ color: "red" }}> Upload Profile Photo</p>
                    </label>
                    {formData.profileImage && (
                        <img
                            src={URL.createObjectURL(formData.profileImage)}
                            alt="profilePhoto"
                            style={{ maxWidth: "80px" }}
                        />
                    )}
                    <button type="submit" disabled={formData.password !== formData.confirmPassword || formData.password === "" || formData.confirmPassword === ""}>Register</button>
                </form>
                <a href="/login">Already have an account? Log In Here</a>
            </div>
        </div>
    );
};

export default RegisterPage;
