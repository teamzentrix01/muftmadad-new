import ChatBot from '@/components/ChatBot'
import Footer from '@/components/Footer'
import Herosection from '@/components/Herosection'
import HospitalsSection from '@/components/hospitals'
import Navbar from '@/components/Navbar'
import OurSpecialities from '@/components/Specialities'
import PatientTestimonials from '@/components/Testimonials'
import MedicalTreatmentsPage from '@/components/Treatments'
// import ImageBanner from '@/components/ImageBanner'
import WhyChooseMuftMadad from '@/components/Whychoose'
import React, { Fragment } from 'react'
import CareEntry from '@/components/care/CareEntry'

const page = () => {
  return (
    <Fragment>
      <Navbar />
      <Herosection />
      <CareEntry />
      <MedicalTreatmentsPage />
      <OurSpecialities />
      <WhyChooseMuftMadad />
      <PatientTestimonials />
      {/* <ImageBanner /> */}
      <HospitalsSection />
      <Footer />
     <ChatBot/>
    </Fragment>
  )
}

export default page
