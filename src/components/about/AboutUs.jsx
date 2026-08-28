import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Home,
  ChevronRight,
  Target,
  Users,
} from "lucide-react";
import useApiQuery from "../../hooks/useApiQuery";
import { getAboutUsData } from "../../services/websettingsService";
import { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const AboutUs = () => {
  // Fetch about us data from API
  const { data: aboutUsResponse, isLoading, isError } = useApiQuery(
    ["about-us"],
    async () => {
      const res = await getAboutUsData();
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const aboutUsData = useMemo(() => {
    if (!aboutUsResponse) return null;
    return aboutUsResponse?.data || aboutUsResponse;
  }, [aboutUsResponse]);

  const missionDescription = useMemo(() => {
    if (!aboutUsData?.mission_description) return "";
    // Split by \r\n to handle line breaks
    return aboutUsData.mission_description.split(/\r\n|\n/).filter(p => p.trim());
  }, [aboutUsData]);

  const values = useMemo(() => {
    if (!aboutUsData?.values) return [];
    return Array.isArray(aboutUsData.values) ? aboutUsData.values : [];
  }, [aboutUsData]);

  const journeys = useMemo(() => {
    if (!aboutUsData?.journeys) return [];
    return Array.isArray(aboutUsData.journeys) ? aboutUsData.journeys : [];
  }, [aboutUsData]);

  const teamMembers = useMemo(() => {
    if (!aboutUsData?.team_members) return [];
    return Array.isArray(aboutUsData.team_members) ? aboutUsData.team_members : [];
  }, [aboutUsData]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <DotsLoader size="lg" />
      </div>
    );
  }

  if (isError || !aboutUsData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <p className="text-red-500 text-lg">Failed to load about us data.</p>
      </div>
    );
  }

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
            <span className="text-gray-900 font-medium">About Us</span>
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
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">About Us</h1>
            <p className="text-white/90 text-lg lg:text-xl max-w-3xl mx-auto">
              We're building the future of e-commerce by connecting customers with trusted sellers worldwide.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-[#1790d7]" />
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          {missionDescription.map((paragraph, index) => (
            <p key={index} className="text-gray-600 text-lg leading-relaxed mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const valueImage = value.image
                ? value.image.startsWith("http")
                  ? value.image
                  : `${imageURL}${value.image}`
                : null;
              return (
                <motion.div
                  key={value.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {valueImage ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={valueImage}
                          alt={value.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-xl">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{value.paragraph || value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 text-lg">Key milestones in our growth</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1790d7] to-[#4db3e8]"></div>
            <div className="space-y-8">
              {journeys.map((journey, index) => (
                <motion.div
                  key={journey.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  <div className="absolute left-6 w-4 h-4 bg-[#1790d7] rounded-full border-4 border-white shadow-lg"></div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-bold text-[#1790d7]">{journey.year}</span>
                      <h3 className="text-xl font-bold text-gray-900">{journey.title}</h3>
                    </div>
                    <p className="text-gray-600">{journey.paragraph || journey.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-gray-600 text-lg">The people behind our success</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => {
              const memberImage = member.image
                ? member.image.startsWith("http")
                  ? member.image
                  : `${imageURL}${member.image}`
                : null;
              return (
                <motion.div
                  key={member.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                >
                  {memberImage ? (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                      <img
                        src={memberImage}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                      {member.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-500 text-sm">{member.designation || member.role}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-2xl p-8 lg:p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Join Us on Our Journey</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Whether you're a customer looking for quality products or a seller wanting to grow your business,
            we'd love to have you be part of our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/sellers"
              className="px-6 py-3 bg-white text-[#1790d7] rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Become a Seller
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;

