
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPlayerProps {
  questions: Question[];
  onComplete: (score: number) => void;
}

export function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const finalScore = (correct / questions.length) * 5;
    setScore(finalScore);
    setShowResult(true);
    onComplete(finalScore);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
    setScore(0);
  };

  if (questions.length === 0) return (
    <div className="p-12 text-center bg-white rounded-[2rem] border">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground font-medium">Este cuestionario aún no tiene preguntas configuradas.</p>
    </div>
  );

  if (showResult) {
    const passed = score >= 3;
    return (
      <Card className="rounded-[3rem] border-none shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className={`p-12 text-center text-white ${passed ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            {passed ? <CheckCircle2 className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
          </div>
          <CardTitle className="text-4xl font-headline font-bold mb-2">
            {passed ? '¡Prueba Superada!' : 'Puedes mejorar'}
          </CardTitle>
          <p className="opacity-80 text-lg">Tu calificación final ha sido:</p>
          <div className="text-6xl font-bold mt-4">{score.toFixed(1)}<span className="text-xl opacity-60">/5.0</span></div>
        </CardHeader>
        <CardContent className="p-12 text-center space-y-8 bg-white">
          <p className="text-slate-600 text-lg">
            {passed 
              ? "Has demostrado un gran dominio de la teoría. ¡Sigue así!" 
              : "Te recomendamos repasar el contenido y volver a intentar el cuestionario."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {!passed && (
              <Button size="lg" onClick={resetQuiz} className="h-14 px-8 rounded-2xl gap-2 font-bold bg-slate-900">
                <RefreshCcw className="h-5 w-5" /> Reintentar Prueba
              </Button>
            )}
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl gap-2 font-bold">
              Ver Resumen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentStep];

  return (
    <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="p-8 md:p-12 border-b bg-slate-50/50">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="secondary" className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/5 text-primary">Knowledge Battle</Badge>
          <span className="text-sm font-bold text-muted-foreground">Pregunta {currentStep + 1} de {questions.length}</span>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-headline font-bold leading-tight text-slate-900">
          {currentQ.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-12">
        <RadioGroup value={answers[currentStep]?.toString()} onValueChange={(v) => handleSelect(parseInt(v))} className="grid gap-4">
          {currentQ.options.map((option, i) => (
            <div 
              key={i} 
              className={`relative flex items-center gap-4 p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${answers[currentStep] === i ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
              onClick={() => handleSelect(i)}
            >
              <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="shrink-0" />
              <Label htmlFor={`opt-${i}`} className="flex-1 text-lg font-medium cursor-pointer leading-relaxed">{option}</Label>
              {answers[currentStep] === i && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="p-8 md:p-12 bg-slate-50/50 border-t flex items-center justify-between">
        <div className="w-full max-w-md">
          <Progress value={((currentStep + 1) / questions.length) * 100} className="h-2 bg-slate-200" />
        </div>
        <Button 
          onClick={nextStep} 
          disabled={answers[currentStep] === undefined} 
          size="lg"
          className="h-14 px-10 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20"
        >
          {currentStep === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
