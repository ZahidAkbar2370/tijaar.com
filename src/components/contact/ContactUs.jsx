import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Headphones,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import useApiQuery from "../../hooks/useApiQuery";
import useApiMutation from "../../hooks/useApiMutation";
import axiosInstance from "../../api/axiosInstance";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: footerData } = useApiQuery(
    ["footer"],
    async () => {
      const res = await axiosInstance.get("/footer");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const contactInfo = footerData?.contact || {};
  const socialLinks = footerData?.socialLinks || {};

  const contactMethods = useMemo(() => {
    return [
      {
        icon: Phone,
        title: "Phone",
        value: contactInfo.phone || "",
        description: "Call us anytime",
        color: "from-green-500 to-emerald-600",
      },
      {
        icon: Mail,
        title: "Email",
        value: contactInfo.email || "",
        description: "Send us an email",
        color: "from-blue-500 to-indigo-600",
      },
      {
        icon: MapPin,
        title: "Address",
        value: contactInfo.address || "",
        description: "Visit our office",
        color: "from-purple-500 to-pink-600",
      },
    ];
  }, [contactInfo]);

  const socialList = useMemo(() => {
    return [
      { icon: Facebook, name: "Facebook", link: socialLinks.facebook || "#", color: "hover:bg-blue-600" },
      { icon: Twitter, name: "Twitter", link: socialLinks.twitter || "#", color: "hover:bg-sky-500" },
      { icon: Instagram, name: "Instagram", link: socialLinks.instagram || "#", color: "hover:bg-pink-600" },
      { icon: Youtube, name: "YouTube", link: socialLinks.youtube || "#", color: "hover:bg-red-600" },
      { icon: Linkedin, name: "LinkedIn", link: socialLinks.linkedin || "#", color: "hover:bg-blue-700" },
    ].filter((s) => s.link);
  }, [socialLinks]);

  const { mutateAsync: sendMessage, isLoading: sending } = useApiMutation(
    async (payload) => axiosInstance.post("/contact", payload),
    {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: "", email: "", subject: "", message: "" });
        }, 3000);
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    await sendMessage(formData);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#1790d7] transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">Contact Us</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-16 lg:py-20"
      >
        <div className="w-full px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Get in Touch</h1>
            <p className="text-white/90 text-lg lg:text-xl max-w-3xl mx-auto">
              Have a question or need help? We're here for you 24/7. Reach out and we'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${method.color} mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-lg font-semibold text-[#1790d7] mb-1">{method.value}</p>
                <p className="text-gray-500 text-sm">{method.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#1790d7]" />
                <h2 className="text-2xl font-bold text-gray-900">Our Location</h2>
              </div>
              <p className="text-gray-600 mt-2">{contactInfo.address || ""}</p>
            </div>
            <div className="relative h-96 bg-gray-100">
              {contactInfo.location ? (
                <iframe
                  src={contactInfo.location}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              ) : null}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-[#1790d7]" />
              <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition-all"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition-all resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Headphones className="w-6 h-6 text-[#1790d7]" />
                <h2 className="text-2xl font-bold text-gray-900">Need Immediate Help?</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Our support team is here to assist you with any questions or concerns.
                You can reach us through phone or email.
              </p>
              <div className="space-y-3">
                <a
                  href={contactInfo.phone ? `tel:${contactInfo.phone}` : "#"}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#1790d7]" />
                  <div>
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-500">{contactInfo.phone || ""}</p>
                  </div>
                </a>
                <a
                  href={contactInfo.email ? `mailto:${contactInfo.email}` : "#"}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#1790d7]" />
                  <div>
                    <p className="font-semibold text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-500">{contactInfo.email || ""}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
              <p className="text-gray-600 mb-4 text-sm">Stay connected with us on social media</p>
              <div className="flex gap-3">
                {socialList.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      className={`p-3 bg-gray-50 rounded-xl text-gray-600 hover:text-white ${social.color} transition-all`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

