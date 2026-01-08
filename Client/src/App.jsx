import Manager from "./components/Manager";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      
      {/* Navbar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Manager />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 py-2 text-center text-xs bg-slate-900 text-slate-200">
        <div className="flex flex-col items-center justify-center gap-1">
          
          {/* KeyOps on top */}
          <h1 className="text-sm font-semibold text-purple-300">
            &lt;Key<span className="text-white">Ops</span> /&gt;
          </h1>

          {/* Created by line */}
          <div className="flex items-center gap-2">
            <span>Created by</span>

            <lord-icon
              src="https://cdn.lordicon.com/xfyxpoer.json"
              trigger="hover"
              colors="primary:#a78bfa"
              style={{ width: "16px", height: "16px" }}
            ></lord-icon>

            <span>AyushdevX</span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;
