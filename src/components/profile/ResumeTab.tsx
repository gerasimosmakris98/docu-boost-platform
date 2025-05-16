
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Globe,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

interface ResumeTabProps {
  resumeData: {
    personal: {
      name: string;
      title: string;
      email: string;
      phone: string;
      location: string;
      website: string;
    };
    summary: string;
    experience: {
      title: string;
      company: string;
      location: string;
      period: string;
      description: string;
    }[];
    education: {
      degree: string;
      school: string;
      location: string;
      year: string;
    }[];
    skills: string[];
    languages: {
      name: string;
      level: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      year: string;
    }[];
  };
  onDownload: () => void;
  onShare: () => void;
}

const ResumeTab = ({ resumeData, onDownload, onShare }: ResumeTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Resume</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="space-y-8">
          {/* Resume Header */}
          <div className="border-b pb-6">
            <h1 className="text-3xl font-bold">{resumeData.personal.name}</h1>
            <p className="text-xl text-muted-foreground mt-1">{resumeData.personal.title}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {resumeData.personal.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {resumeData.personal.phone}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {resumeData.personal.location}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {resumeData.personal.website}
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
            <p>{resumeData.summary}</p>
          </div>
          
          {/* Experience */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </h2>
            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <div>{exp.company}, {exp.location}</div>
                    <div>{exp.period}</div>
                  </div>
                  <p className="mt-2 text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <div>{edu.school}, {edu.location}</div>
                    <div>{edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Certifications */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <h3 className="font-semibold">{cert.name}</h3>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <div>{cert.issuer}</div>
                    <div>{cert.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Languages */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Languages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {resumeData.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/40 p-2 rounded">
                  <span>{lang.name}</span>
                  <span className="text-sm text-muted-foreground">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResumeTab;
