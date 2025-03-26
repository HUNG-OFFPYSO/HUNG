import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Facebook, Phone, SendHorizontal } from "lucide-react";
import { TypedText } from "@/components/ui/typed-text";

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
            <img
              src="https://image3.luatvietnam.vn/uploaded/665twebp/images/original/2024/07/28/khong-gian-mang-co-vai-tro-ket-noi-cac-co-so-ha-tang-cong-nghe-thong-tin_2807172136.png"
              alt="Ảnh đại diện"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" style={{userSelect: 'none'}}>
            <TypedText
              strings={[
                "HƯNG_OFFPYSO",
                "Python Developer",
                "Security Researcher",
                "Ethical Hacker"
              ]}
            />
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" style={{userSelect: 'none'}}>
            Lập trình viên Full Stack với niềm đam mê tạo ra các ứng dụng web đẹp và chức năng
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/contact">Liên hệ ngay</Link>
            </Button>
            <Button variant="outline" asChild className="border-2 border-gradient-to-r from-blue-500 to-purple-500">
              <Link href="/projects">Xem dự án</Link>
            </Button>
          </div>
          <div className="flex justify-center gap-6 pt-4">
            <a href="https://facebook.com/HUNGOFFPYSO" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-purple-500 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://t.me/hungoffpyso" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-purple-500 transition-colors">
              <SendHorizontal className="w-6 h-6" />
            </a>
            <a href="tel:0559820159" className="text-blue-500 hover:text-purple-500 transition-colors">
              <Phone className="w-6 h-6" />
            </a>
          </div>
        </motion.div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" style={{userSelect: 'none'}}>Về tôi</h2>
        <div className="prose prose-lg max-w-none" style={{userSelect: 'none'}}>
          <p>
            Tôi là một lập trình viên full stack với hơn 5 năm kinh nghiệm xây dựng ứng dụng web.
            Tôi chuyên về Python và các công nghệ bảo mật. Niềm đam mê của tôi là tạo ra
            các giải pháp an toàn và hiệu quả cho người dùng.
          </p>
          <p>
            Khi không code, bạn có thể tìm thấy tôi đang nghiên cứu về bảo mật, tham gia các
            cuộc thi CTF và chia sẻ kiến thức với cộng đồng.
          </p>
        </div>
      </section>
    </div>
  );
}