import { Switch, Route, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Article from "@/pages/Article";
import { findArticle } from "@shared/articles";

function ArticleRoute() {
  const params = useParams<{ slug: string }>();
  const article = findArticle(`/articles/${params.slug ?? ""}`);
  return article ? <Article article={article} /> : <NotFound />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/articles/:slug" component={ArticleRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
