import { useAITeacher } from "@/app/hooks/useAITeacher";
import { teachers } from "@/app/components/Teacher";
export const BoardSetting = () => {
  const teacher = useAITeacher((state) => state.teacher);
  const setTeacher = useAITeacher((state) => state.setTeacher);

  return (
    <>
      <div className="absolute right-0 bottom-full flex flex-row gap-10 mb-20">
        {teachers.map((sensei, idx) => (
          <div
            key={idx}
            className={`p-3 transition-colors duration-500 ${
              teacher === sensei ? "bg-white/80" : "bg-white/40"
            }`}
          >
            <div onClick={() => setTeacher(sensei)}>
              <img
                src={`/images/${sensei}.jpg`}
                alt={sensei}
                className="object-cover w-40 h-40"
              />
              {/* ${sensei}.jpg */}
            </div>
            <h2 className="text-3xl font-bold mt-3 text-center">{sensei}</h2>
          </div>
        ))}
      </div>
    </>
  );
};
