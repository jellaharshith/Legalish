"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-white mb-4">
              Never read <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                legal terms
              </span>
              <br />
              <span className="text-4xl md:text-[5rem] font-bold mt-1 leading-none text-white">
                again
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              V.O.L.T uses AI to translate complex legal documents into plain English, 
              highlighting red flags and saving you hours of reading.
            </p>
          </>
        }
      >
        <img
          src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1400&h=720&dpr=2"
          alt="V.O.L.T legal document analysis interface showing AI-powered contract review"
          className="mx-auto rounded-2xl object-cover h-full object-center w-full"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}