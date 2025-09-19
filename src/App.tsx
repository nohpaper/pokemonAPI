import { BrowserRouter } from "react-router-dom";
import Main from "./component/Main.tsx";

function App() {
    return (
        <BrowserRouter>
            <div className="flex justify-center px-[150px] py-[150px]">
                <Main />
            </div>
        </BrowserRouter>
    );
}

export default App;
