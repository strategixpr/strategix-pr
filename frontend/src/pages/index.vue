<script setup lang="ts">
import Header from '@/widgets/header';
import Welcome from '@/widgets/welcome';
import AboutUs from '@/widgets/about-us';
import Services from '@/widgets/services';
import OurProjects from '@/widgets/our-projects';
import MarketResponse from '@/widgets/market-response';
import OurTeam from '@/widgets/our-team';
import LeaveRequest from '@/widgets/leave-request';
import Footer from '@/widgets/footer';
</script>

<template>
  <Header /> 
  <main>
    <Welcome />
    <AboutUs />
    <Services />
    <OurProjects />
    <MarketResponse />
    <OurTeam />
    <LeaveRequest />
  </main>
  <Footer />
</template>

