import { Inquiry } from "../models/Inquiry.model.js";


// Controller to create an inquiry
const createInquiry = async (req, res) => {
      try {
            // Extract data from the request body
            const { name, email, mobile, pincode, product, termsAccept } = req.body;

            // Create a new inquiry instance
            const newInquiry = new Inquiry({
                  name,
                  email,
                  mobile,
                  pincode,
                  product,
                  termsAccept,
            });

            // Save the inquiry to the database
            await newInquiry.save();

            // Send a success response
            res.status(201).json({ success: true, message: 'Inquiry created successfully.', inquiry: newInquiry });
      } catch (error) {
            // Handle errors, including validation errors
            if (error.name === 'ValidationError') {
                  // Extract error messages from validation errors
                  const errors = Object.values(error.errors).map(err => err.message);
                  res.status(400).json({ success: false, message: 'Validation failed.', errors });
            } else {
                  // General error handling
                  res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
            }
      }
};
const getAllInquiries = async (req, res) => {
      try {
            // Retrieve all inquiries from the database
            const inquiries = await Inquiry.find();

            // Send a success response with the list of inquiries
            res.status(200).json({ success: true, inquiries });
      } catch (error) {
            // General error handling
            res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
      }
};

const deleteInquiryById = async (req, res) => {
      try {
            // Extract the ID from the request query parameters
            const { id } = req.query;

            // Check if ID is provided
            if (!id) {
                  return res.status(400).json({ success: false, message: 'Inquiry ID is required.' });
            }

            // Find and delete the inquiry by ID
            const result = await Inquiry.findByIdAndDelete(id);

            // Check if inquiry was found and deleted
            if (!result) {
                  return res.status(404).json({ success: false, message: 'Inquiry not found.' });
            }

            // Send a success response
            res.status(200).json({ success: true, message: 'Inquiry deleted successfully.' });
      } catch (error) {
            // Handle errors
            res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
      }
};

export { createInquiry, getAllInquiries, deleteInquiryById };
