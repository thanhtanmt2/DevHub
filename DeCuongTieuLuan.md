# **BỘ GIÁO DỤC VÀ ĐÀO TẠO TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP. HCM KHOA CÔNG NGHỆ THÔNG TIN** PO 

**ĐỀ CƯƠNG TIỂU LUẬN CHUYÊN NGÀNH : CÔNG NGHỆ PHẦN MỀM** 

**ĐỀ TÀI: XÂY DỰNG NỀN TẢNG KẾT NỐI VIỆC LÀM VÀ NHÂN SỰ CÔNG NGHỆ THÔNG TIN THEO MÔ HÌNH FREELANCE VÀ REMOTE** 

**GVHD** : PGS.TS HOÀNG VĂN DŨNG **Sinh viên thực hiện:** 1. Đào Minh Nhựt 23110282 2. Lê Thanh Tân 23110316 Thành phố Hồ Chí Minh, Tháng 9 năm 2026 a 

|**MỤC LỤC**|
|---|
|CHƯƠNG 1 TỔNG QUAN ĐỀ TÀI..............................................................................1|
|1.1 Đặt vấn đề:.............................................................................................................1|
|1.2 Mục tiêu đề tài:......................................................................................................2|
|1.3 Đối tượng và phạm vi nghiên cứu:........................................................................3|
|CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ DỰ KIẾN...............................4|
|2.1 Kiến trúc hệ thống.................................................................................................4|
|2.1.1 Mô hình Client-Server....................................................................................4|
|2.1.2 Kiến trúc MVC...............................................................................................5|
|2.1.3 RESTful API..................................................................................................5|
|2.1.4 Cơ chế phân quyền RBAC.............................................................................6|
|2.2 Nền tảng công nghệ...............................................................................................7|
|2.2.1 Backend – Node.js..........................................................................................7|
|2.2.2 Framework Backend – Express.js..................................................................8|
|2.2.3 Frontend – React............................................................................................8|
|2.2.4 Cơ sở dữ liệu – PostgreSQL...........................................................................9|
|2.2.5 Sự phù hợp của bộ công nghệ........................................................................9|
|2.3 Công cụ hỗ trợ.....................................................................................................10|
|2.3.1 ClickUp........................................................................................................10|
|2.3.2 Figma............................................................................................................10|
|2.3.3 Git.................................................................................................................11|
|2.3.4 Tổng hợp công nghệ và công cụ dự kiến.....................................................11|
|CHƯƠNG 3: PHÂN TÍCH YÊU CẦU.........................................................................13|
|3.1 Phân tích yêu cầu.................................................................................................13|
|3.1.1 Yêu cầu chức năng.......................................................................................13|
|3.1.2 Yêu cầu phi chức năng.................................................................................14|
|3.2 Lập danh sách yêu cầu.........................................................................................15|
|3.2.1 Bảng yêu cầu chức năng nghiệp vụ..............................................................15|
|3.2.2 Bảng yêu cầu chức năng hệ thống................................................................19|
|3.2.3 Bảng yêu cầu về chất lượng.........................................................................20|
|3.3 Mô hình hóa yêu cầu...........................................................................................21|
|3.3.1 Nhận diện tác nhân và chức năng trong sơ đồ usecase................................21|



|3.3.2 Sơ đồ usecase...............................................................................................24|
|---|
|3.3.3 Đặc tả usecase..................................................................................................24|
|CHƯƠNG 4: THIẾT KẾ DỮ LIỆU..............................................................................46|
|4.1 Sơ đồ Logic.........................................................................................................46<br>|
|4.2 Chi tiết các bảng dữ liệu......................................................................................46|
|4.2.1 Bảng Vai trò (Roles).....................................................................................46|
|4.2.2 Bảng Quyền (permissions)...........................................................................47|
|4.2.3 Bảng Vai Trò - Quyền (role_permissions)...................................................48|
|4.2.4 Bảng Tài khoản (Users)................................................................................48|
|4.2.5 Bảng Tài khoản - Vai Trò (user_roles)........................................................49|
|4.2.6 Bảng hồ sơ ứng viên (candidate_profiles)....................................................50|
|4.2.7 Bảng Kinh nghiệm (experiences).................................................................51|
|4.2.8 Bảng kỹ năng (Skills)...................................................................................52|
|4.2.9 Bảng Ứng viên - Kỹ năng (candidate_skills)...............................................52|
|4.2.10 Bảng thông tin nhận tiền (payment_information)......................................53|
|4.2.11 Bảng Doanh nghiệp (companies)...............................................................54|
|4.2.12 Bảng Tin tuyển dụng (job_posts)...............................................................55|
|4.2.13 Bảng Tin tuyển dụng - Kỹ năng (job_post_skills).....................................57|
|4.2.14 Bảng Hồ sơ ứng tuyển (applications).........................................................57|
|4.2.15 Bảng Lịch sử trạng thái ứng tuyển (application_status_history)................58|
|4.2.16 Bảng dự án nội bộ (internal_projects)........................................................59|
|4.2.17 Bảng Workspace (workspaces)..................................................................60|
|4.2.18 Bảng Thành viên Workspace (workspace_members)................................61|
|4.2.19 Bảng Task (tasks).......................................................................................61|
|4.2.20 Bảng Bài nộp Task (task_submissions)......................................................63|
|4.2.21 Bảng Đánh giá năng lực (candidate_evaluations)......................................63|
|4.2.22 Bảng Thanh toán (payments).....................................................................64|
|CHƯƠNG 5: THIẾT KẾ GIAO DIỆN.........................................................................67|
|5.1. Dùng figma để thiết kế giao diện tham khảo......................................................67|
|5.1.1. Đăng nhập....................................................................................................68|
|5.1.2. Trang chủ Freelancer...................................................................................69|
|5.1.3. Tìm kiếm việc làm.......................................................................................69|



|5.1.4. Chi tiết việc làm..........................................................................................70|
|---|
|5.1.5. Ứng tuyển....................................................................................................71|
|5.1.6. Hồ sơ năng lực.............................................................................................72|
|5.1.7. Theo dõi hồ sơ ứng tuyển............................................................................75|
|5.1.8. Workspace Kanban......................................................................................76|
|5.1.9. Chi tiết Task................................................................................................77|
|5.1.10. Employer Dashboard.................................................................................78|
|5.1.11. Tìm kiếm ứng viên....................................................................................79|
|5.1.12. Admin Dashboard......................................................................................80|
|5.1.13. Quản lý người dùng...................................................................................81|
|5.1.14. Quản lý tuyển dụng nội bộ........................................................................81|
|5.1.15. Workspace Admin.....................................................................................82|
|5.1.16. Nghiệm thu & đánh giá.............................................................................82|
|5.1.17. Thanh toán thù lao.....................................................................................83|
|5.1.18. Thống kê & báo cáo..................................................................................84|
|5.2. Thiết kế giao diện hệ thống:...............................................................................84|
|5.2.1. Nhận xét giao diện được tạo từ Figma........................................................84|
|5.2.2. Mục tiêu thiết kế giao diện..........................................................................85|
|5.2.3. Giao diện thực tế của Website.....................................................................86|
|CHƯƠNG 6:KẾ HOẠCH TRIỂN KHAI VÀ PHƯƠNG ÁN KIỂM THỬ.................87|
|6.1 Kế hoạch triển khai:............................................................................................87|
|6.1.1. Các giai đoạn triển khai...............................................................................87|
|6.1.2. Triển khai cơ sở dữ liệu...............................................................................88|
|6.1.3. Triển khai Backend.....................................................................................89|
|6.1.4. Triển khai Frontend.....................................................................................90|
|6.1.5. Quản lý mã nguồn và tiến độ.......................................................................90|
|6.2. Phương án kiểm thử dự kiến..............................................................................90|
|6.2.1. Mục tiêu kiểm thử.......................................................................................90|
|6.2.2. Phạm vi kiểm thử........................................................................................91|
|6.2.3. Hướng tiếp cận kiểm thử.............................................................................92|
|6.2.4. Các chức năng dự kiến kiểm thử.................................................................93|
|6.2.5. Kiểm thử phân quyền và bảo mật................................................................95|



|6.2.6. Kiểm thử dữ liệu..........................................................................................96|
|---|
|6.2.7. Kiểm thử giao diện và khả năng tương thích..............................................96|
|6.2.8. Môi trường và công cụ kiểm thử.................................................................97|
|6.2.9. Rủi ro trong quá trình kiểm thử...................................................................98|
|6.2.10. Quản lý lỗi.................................................................................................98|
|6.2.11. Tiêu chí hoàn thành kiểm thử....................................................................98|
|CHƯƠNG 7: KẾT QUẢ DỰ KIẾN VÀ HƯỚNG PHÁT TRIỂN.............................100|
|7.1 Kết quả dự kiến:................................................................................................100|
|7.1.1. Hoàn thiện nền tảng quản lý tài khoản và phân quyền..............................100|
|7.1.2. Hoàn thiện hồ sơ năng lực dành cho nhân sự IT.......................................100|
|7.1.3. Hoàn thiện chức năng tuyển dụng và ứng tuyển.......................................101|
|7.1.4. Hoàn thiện quy trình quản lý dự án nội bộ................................................101|
|7.1.5. Hoàn thiện chức năng nghiệm thu và đánh giá năng lực..........................101|
|7.1.6. Hoàn thiện chức năng thanh toán thù lao..................................................102|
|7.1.7. Hoàn thiện chức năng thống kê và báo cáo...............................................102|
|7.1.8. Kết quả về mặt kỹ thuật.............................................................................103|
|7.1.9. Kết quả về mặt học thuật...........................................................................103|
|7.2 Hướng phát triển:..............................................................................................104|
|7.2.1. Phát triển hệ thống Chat nội bộ.................................................................104|
|7.2.2. Tích hợp phỏng vấn trực tuyến.................................................................104|
|7.2.3. Mở rộng hệ thống gợi ý việc làm và ứng viên..........................................104|
|7.2.4 Hoàn thiện hệ thống đánh giá năng lực......................................................104|
|7.2.5. Mở rộng quy mô doanh nghiệp và người dùng.........................................105|



## **CHƯƠNG 1 TỔNG QUAN ĐỀ TÀI** 

## **1.1 Đặt vấn đề:** 

Trong bối cảnh ngành Công nghệ thông tin phát triển mạnh mẽ, xu hướng làm việc linh hoạt như Freelance, Part-time và Remote đang trở thành lựa chọn ưu tiên để tối ưu hóa nguồn lực. Xét dưới góc độ của một đơn vị phát triển phần mềm (đồng thời là chủ quản website), nhu cầu tìm kiếm và thuê nhân sự IT từ xa để tham gia vào các dự án ngắn hạn nội bộ diễn ra rất thường xuyên. Tuy nhiên, việc phải phụ thuộc vào các sàn tuyển dụng bên ngoài để tìm người, sau đó lại sử dụng các công cụ rời rạc khác để giao việc, quản lý tiến độ và nghiệm thu đang gây ra sự đứt gãy nghiêm trọng trong quy trình quản lý. 

Từ bài toán thực tiễn đó, giải pháp cấp thiết là xây dựng một nền tảng tích hợp khép kín, trước hết nhằm phục vụ chính nhu cầu quản trị của đơn vị chủ quản. Hệ thống được thiết kế để chủ web có thể tự đăng tin, sàng lọc ứng viên và cung cấp một phân hệ "không gian làm việc" để trực tiếp điều phối, quản lý toàn bộ vòng đời dự án nội bộ trên một nền tảng duy nhất. Điểm đột phá của hệ thống nằm ở cơ chế đánh giá thực tiễn: khi ứng viên tham gia và hoàn thành các dự án do chủ web tổ chức, hệ thống sẽ lưu vết và cấp cho họ các điểm số đánh giá năng lực khách quan. Điều này giúp ứng viên sở hữu một hồ sơ năng lực có độ tin cậy tuyệt đối. 

Không chỉ dừng lại ở việc giải quyết bài toán nội bộ, hệ thống được định hướng mở rộng liên kết, trở thành một trung tâm kết nối việc làm cho các doanh nghiệp đối tác bên ngoài. Dựa trên nguồn dữ liệu ứng viên đã được xác thực năng lực thông qua các dự án của chủ web, các doanh nghiệp khác có thể dễ dàng tham gia đăng tin, tiếp cận và tuyển dụng được đội ngũ nhân sự chất lượng cao mà không tốn nhiều chi phí sàng lọc hay lo ngại rủi ro về năng lực. Sự kết hợp này tạo ra một hệ sinh thái cộng hưởng, vừa tối ưu hóa quy trình quản trị nội bộ của chủ web, vừa mang lại giá trị to lớn cho cộng đồng nhân sự IT và các nhà tuyển dụng trên thị trường. 

1 

## **1.2 Mục tiêu đề tài:** 

**Mục tiêu chung:** Nghiên cứu và phát triển một nền tảng Web tích hợp (Hybrid Platform) chuyên biệt cho nhân sự ngành Công nghệ thông tin, với mục tiêu cốt lõi ban đầu là tự động hóa và khép kín quy trình tuyển dụng, quản trị dự án nội bộ cho chính đơn vị chủ quản. Dựa trên nền tảng quản trị đó, hệ thống tiếp tục mở rộng quy mô thành một hệ sinh thái kết nối việc làm, cho phép các doanh nghiệp đối tác bên ngoài tham gia tuyển dụng nhân sự linh hoạt (Freelance, Part-time, Remote) dựa trên nguồn dữ liệu ứng viên đã được hệ thống đánh giá và xác thực năng lực. 

## **Mục tiêu cụ thể:** 

- **Xây dựng phân hệ quản trị dự án nội bộ (Dành cho Chủ web):** Thiết lập một không gian làm việc số chuyên sâu để chủ web trực tiếp giải quyết bài toán thiếu hụt nhân sự. Phân hệ này cung cấp đầy đủ các công cụ từ thêm ứng viên vào dự án, phân công công việc, theo dõi tiến độ, đến nghiệm thu sản phẩm, đánh giá và trả thù lao. 

- **Thiết lập hồ sơ năng lực:** Xây dựng luồng đánh giá thực chiến làm cầu nối uy tín. Khi ứng viên tham gia và hoàn thành dự án nội bộ, hệ thống sẽ tự động tổng hợp hiệu suất, cập nhật điểm đánh giá và ghi nhận lịch sử dự án vào hồ sơ công khai của họ. Mục tiêu là tạo ra những bản CV có độ tin cậy tuyệt đối, không chỉ do ứng viên tự khai báo mà được bảo chứng bởi chính chủ hệ thống. 

- **Mở rộng phân hệ Sàn giao dịch việc làm:** Phát triển các tính năng hỗ trợ nhà tuyển dụng bên ngoài đăng tin, tra cứu và khai thác nguồn ứng viên chất lượng. Đồng thời, cung cấp cho người tìm việc bộ công cụ thiết lập hồ sơ IT chuyên nghiệp, dễ dàng ứng tuyển vào cả dự án của chủ web lẫn các doanh nghiệp liên kết. 

- **Mục tiêu về mặt kỹ thuật phần mềm:** Vận dụng linh hoạt các kiến thức kỹ thuật phần mềm để phân tích yêu cầu, thiết kế cơ sở dữ liệu chặt chẽ đáp ứng mô hình đa quyền (RBAC). Ứng dụng các công nghệ Full-stack hiện đại để xây dựng hệ thống có hiệu năng cao, bảo mật và có khả năng mở rộng luồng dữ liệu khi số lượng doanh nghiệp tham gia tăng lên. 

2 

## **1.3 Đối tượng và phạm vi nghiên cứu:** 

**Đối tượng nghiên cứu:** Đề tài tập trung nghiên cứu quy trình tuyển dụng và quản trị luồng công việc nội bộ dành riêng cho doanh nghiệp phát triển phần mềm (đóng vai trò là Chủ website), kết hợp với mô hình sàn giao dịch việc làm linh hoạt (Freelance, Parttime, Remote) cho lĩnh vực Công nghệ thông tin. Về mặt hệ thống, đối tượng nghiên cứu là giải pháp kiến trúc phần mềm lai (Hybrid Platform) tích hợp giữa không gian làm việc số và cổng kết nối tuyển dụng. Đề tài giải quyết bài toán giao thoa dữ liệu và phân quyền nghiệp vụ giữa ba nhóm người dùng cốt lõi: Chủ website, Người tìm việc và Nhà tuyển dụng đối tác. 

**Phạm vi về mặt nghiệp vụ:** Hệ thống giới hạn không gian hoạt động chuyên biệt cho ngách nhân sự IT. Các luồng tính năng được phân định rõ theo từng nhóm tác nhân, lấy quy trình quản trị nội bộ của Chủ website làm trung tâm: 

- **Chủ website (Quản trị viên):** Được cấp quyền khai thác toàn bộ vòng đời của hệ thống. Bên cạnh việc quản lý các thông số chung, Chủ website sử dụng hệ thống để trực tiếp đăng tin, tuyển ứng viên và đưa vào phân hệ Không gian làm việc nội bộ. Tại đây, luồng công việc được khép kín từ khâu giao nhiệm vụ, theo dõi tiến độ, nghiệm thu, cho đến việc chấm điểm đánh giá cho ứng viên. 

- **Người tìm việc (Ứng viên):** Được cung cấp công cụ xây dựng hồ sơ năng lực chuyên ngành, tra cứu việc làm và nộp hồ sơ. Khi tham gia dự án của Chủ web, ứng viên tương tác trực tiếp với bảng công việc để nhận task và báo cáo kết quả. Lưu vết đánh giá năng lực với những dự án thực chiến. 

- **Nhà tuyển dụng (Đối tác bên ngoài):** Đối với nhóm này, hệ thống hoạt động thuần túy như một nền tảng kết nối. Họ có thể đăng tin, tìm kiếm, khai thác nguồn ứng viên chất lượng cao. Nhóm này không tham gia vào phân hệ quản lý dự án và luồng làm việc nội bộ của Chủ website. 

3 

## **CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ DỰ KIẾN** 

## **2.1 Kiến trúc hệ thống** 

Việc lựa chọn kiến trúc hệ thống cần xuất phát từ đặc điểm nghiệp vụ và yêu cầu vận hành của nền tảng. Đề tài xây dựng một hệ thống Web có nhiều nhóm người dùng, trong đó mỗi nhóm có chức năng và quyền hạn khác nhau. Bên cạnh các chức năng tuyển dụng và quản lý hồ sơ, hệ thống còn có phân hệ quản lý dự án nội bộ với các hoạt động liên quan đến công việc, tiến độ, nghiệm thu và đánh giá. 

Đặc điểm này đặt ra yêu cầu hệ thống phải có khả năng phân tách rõ giữa giao diện người dùng, xử lý nghiệp vụ và lưu trữ dữ liệu; đồng thời bảo đảm dữ liệu được quản lý tập trung, quyền truy cập được kiểm soát và các thành phần có thể phát triển độc lập. 

Trên cơ sở đó, nhóm dự kiến xây dựng hệ thống theo mô hình Client-Server, tổ chức phần Backend theo kiến trúc MVC (Model – View – Controller), sử dụng RESTful API để giao tiếp giữa Client và Server, đồng thời áp dụng RBAC (Role-Based Access Control) cho cơ chế phân quyền. 

## **2.1.1 Mô hình Client-Server** 

Mô hình Client-Server là mô hình kiến trúc trong đó hệ thống được phân chia thành hai thành phần chính. Client là phía trực tiếp tương tác với người dùng và gửi yêu cầu đến hệ thống. Server tiếp nhận yêu cầu, thực hiện xử lý nghiệp vụ, truy xuất hoặc cập nhật dữ liệu và trả kết quả về Client. 

Một ưu điểm quan trọng của mô hình Client-Server là khả năng phân tách trách nhiệm giữa phía giao diện và phía máy chủ. Client tập trung vào việc trình bày thông tin và tương tác với người dùng, trong khi Server chịu trách nhiệm xử lý nghiệp vụ và kiểm soát dữ liệu. Nhờ đó, các quy tắc nghiệp vụ không bị phân tán trên nhiều giao diện khác nhau. 

Đối với đề tài, hệ thống có nhiều nhóm người dùng với những quyền hạn khác nhau và cùng sử dụng một nguồn dữ liệu tập trung. Việc áp dụng Client-Server giúp tập trung phần xử lý nghiệp vụ và dữ liệu ở phía Server, từ đó thuận lợi cho việc kiểm soát quyền truy cập và duy trì tính nhất quán của hệ thống. 

4 

Ngoài ra, Client-Server tạo sự độc lập tương đối giữa hai phía. Frontend có thể được thay đổi hoặc phát triển thêm mà không cần thay đổi toàn bộ hệ thống Backend. Điều này phù hợp với định hướng phát triển nền tảng theo từng giai đoạn và khả năng mở rộng thêm các loại Client trong tương lai. 

## **2.1.2 Kiến trúc MVC** 

MVC là một mô hình kiến trúc phần mềm dùng để phân tách ứng dụng thành ba thành phần có trách nhiệm khác nhau: 

- Model: Quản lý dữ liệu và các hoạt động liên quan đến dữ liệu. 

- View: Chịu trách nhiệm trình bày dữ liệu và giao diện cho người dùng. 

- Controller: Tiếp nhận yêu cầu, điều phối quá trình xử lý và trả kết quả. 

Mục tiêu chính của MVC là giảm sự phụ thuộc giữa giao diện và xử lý nghiệp vụ. Khi các thành phần được phân chia theo trách nhiệm, mã nguồn sẽ có cấu trúc rõ ràng hơn, thuận lợi cho quá trình phát triển, kiểm thử và bảo trì. 

Đề tài có số lượng nghiệp vụ tương đối lớn và các chức năng có sự liên kết với nhau. Nếu toàn bộ xử lý được đặt trong một cấu trúc mã nguồn không phân tách, hệ thống sẽ khó quản lý và khó mở rộng khi số lượng chức năng tăng. Vì vậy, việc áp dụng tư tưởng MVC cho Backend giúp nhóm tổ chức các thành phần xử lý theo từng trách nhiệm riêng biệt. 

Trong kiến trúc tổng thể của đề tài, phần giao diện được xây dựng riêng bằng React nên View được thể hiện chủ yếu ở phía Frontend, trong khi Backend tập trung vào Model và Controller cùng các tầng xử lý nghiệp vụ liên quan. Cách tổ chức này phù hợp với kiến trúc Client-Server và giúp Frontend, Backend có mức độ độc lập cao hơn. 

## **2.1.3 RESTful API** 

RESTful API là cách thiết kế giao diện giao tiếp giữa các hệ thống dựa trên các nguyên tắc của REST (Representational State Transfer). REST sử dụng giao thức HTTP để thực hiện trao đổi dữ liệu giữa Client và Server, trong đó các tài nguyên của hệ thống được tổ chức thành các địa chỉ tài nguyên và được thao tác thông qua các phương thức HTTP. 

5 

Một đặc điểm quan trọng của REST là tính stateless, nghĩa là mỗi yêu cầu từ Client phải chứa đầy đủ thông tin cần thiết để Server xử lý yêu cầu đó. Server không cần duy trì trạng thái phiên xử lý của từng yêu cầu giữa các lần giao tiếp. Điều này giúp kiến trúc API có tính độc lập và thuận lợi hơn trong việc mở rộng. 

RESTful API cũng tạo ra sự tách biệt giữa Frontend và Backend. Frontend chỉ cần giao tiếp với các API đã được định nghĩa, trong khi Backend chịu trách nhiệm xử lý nghiệp vụ và dữ liệu. Nhờ vậy, hai phần có thể được phát triển và kiểm thử tương đối độc lập. 

Đối với đề tài, hệ thống có nhiều nhóm người dùng và số lượng chức năng lớn, do đó cần một cơ chế giao tiếp thống nhất giữa giao diện và máy chủ. RESTful API đáp ứng yêu cầu này, đồng thời tạo nền tảng để hệ thống có thể mở rộng về phía Client mà không phải thay đổi toàn bộ logic xử lý nghiệp vụ. 

## **2.1.4 Cơ chế phân quyền RBAC** 

RBAC (Role-Based Access Control) là mô hình kiểm soát truy cập dựa trên vai trò. Thay vì cấp quyền trực tiếp cho từng người dùng, hệ thống xác định các vai trò và gán tập hợp quyền tương ứng cho từng vai trò. Người dùng sau đó được gán vào một hoặc nhiều vai trò để có được những quyền cần thiết. 

RBAC giúp việc quản lý quyền trở nên tập trung và có cấu trúc. Khi số lượng người dùng tăng, hệ thống không cần xây dựng một tập hợp quyền riêng biệt cho từng tài khoản mà có thể quản lý thông qua vai trò. 

Đặc điểm này phù hợp với đề tài vì hệ thống có ba nhóm người dùng chính gồm Chủ website, Người tìm việc và Nhà tuyển dụng đối tác, mỗi nhóm có phạm vi nghiệp vụ khác nhau. Việc áp dụng RBAC giúp hệ thống kiểm soát quyền truy cập theo đúng trách nhiệm của từng nhóm, hạn chế việc người dùng thực hiện những thao tác ngoài phạm vi được cấp phép. 

RBAC cũng tạo khả năng mở rộng khi hệ thống phát sinh thêm các vai trò hoặc yêu cầu phân quyền mới trong quá trình phát triển. 

6 

## **2.2 Nền tảng công nghệ** 

Sau khi xác định kiến trúc hệ thống, việc lựa chọn công nghệ cần dựa trên khả năng đáp ứng các yêu cầu thực tế của đề tài. Hệ thống cần một nền tảng Backend có khả năng xử lý nhiều yêu cầu Web và xây dựng API; một công nghệ Frontend hỗ trợ xây dựng giao diện có tính tương tác cao; đồng thời cần một hệ quản trị cơ sở dữ liệu bảo đảm tính nhất quán đối với lượng dữ liệu có nhiều mối quan hệ. 

Trên cơ sở đó, nhóm dự kiến lựa chọn Node.js và Express.js cho Backend, React cho Frontend và PostgreSQL cho cơ sở dữ liệu. 

## **2.2.1 Backend – Node.js** 

Node.js là môi trường thực thi JavaScript phía máy chủ, được xây dựng trên JavaScript engine V8. Khác với mô hình xử lý truyền thống sử dụng một luồng xử lý riêng cho từng yêu cầu, Node.js sử dụng mô hình event-driven kết hợp với non-blocking I/O. 

Cơ chế non-blocking I/O cho phép chương trình tiếp tục xử lý các công việc khác trong khi chờ những thao tác I/O hoàn thành. Đặc điểm này phù hợp với các ứng dụng Web có nhiều hoạt động giao tiếp giữa Client và Server. 

Bên cạnh đó, Node.js sử dụng JavaScript ở phía Server, trong khi React cũng sử dụng JavaScript ở phía Client. Việc sử dụng cùng một ngôn ngữ cho hai phía giúp giảm sự khác biệt về công nghệ trong quá trình phát triển, tạo thuận lợi cho nhóm khi xây dựng và duy trì hệ thống. 

Về mặt thực tế, nền tảng của đề tài chủ yếu thực hiện các nghiệp vụ Web, xử lý API và giao tiếp với cơ sở dữ liệu. Các đặc điểm event-driven và non-blocking I/O của Node.js phù hợp với dạng ứng dụng này. Đồng thời, khả năng tổ chức Backend thành các module và cung cấp RESTful API đáp ứng yêu cầu kiến trúc đã lựa chọn. 

Vì vậy, Node.js được lựa chọn làm nền tảng cho Backend nhằm đáp ứng yêu cầu về khả năng xử lý yêu cầu Web, tính linh hoạt trong phát triển và sự đồng nhất về ngôn ngữ lập trình giữa Frontend và Backend. 

7 

## **2.2.2 Framework Backend – Express.js** 

Express.js là một Web framework được xây dựng trên Node.js, cung cấp các cơ chế cần thiết để phát triển ứng dụng Web và RESTful API. 

Express.js có cấu trúc tương đối đơn giản và linh hoạt, cho phép tổ chức hệ thống thông qua Routing và Middleware. Middleware có thể được sử dụng để thực hiện các hoạt động xử lý trung gian như xác thực, phân quyền, kiểm tra dữ liệu đầu vào và xử lý lỗi. 

Đối với đề tài, Backend phải xử lý nhiều nhóm nghiệp vụ và đồng thời kiểm soát quyền truy cập của các nhóm người dùng. Việc Express.js hỗ trợ Middleware giúp nhóm có thể tổ chức các bước kiểm tra và xử lý chung theo một cấu trúc thống nhất, hạn chế việc lặp lại logic trong nhiều chức năng. 

Express.js cũng phù hợp với kiến trúc MVC và RESTful API đã được lựa chọn. Framework này không áp đặt cấu trúc quá phức tạp, do đó nhóm có thể chủ động tổ chức các tầng xử lý theo yêu cầu của hệ thống. 

Vì vậy, Express.js được lựa chọn kết hợp với Node.js để xây dựng Backend vì có khả năng đáp ứng tốt yêu cầu phát triển RESTful API, tổ chức Middleware, định tuyến và phân tách các thành phần xử lý. 

## **2.2.3 Frontend – React** 

React là một thư viện JavaScript mã nguồn mở dùng để xây dựng giao diện người dùng. Nền tảng cốt lõi của React là mô hình Component, trong đó giao diện được chia thành các thành phần độc lập có thể tái sử dụng. 

Một đặc điểm quan trọng của React là cơ chế quản lý trạng thái và cập nhật giao diện dựa trên sự thay đổi của dữ liệu. React sử dụng Virtual DOM để tối ưu quá trình cập nhật giao diện, giúp các ứng dụng có nhiều tương tác với người dùng hoạt động linh hoạt hơn. 

Đối với đề tài, hệ thống có nhiều nhóm người dùng và mỗi nhóm có giao diện cũng như chức năng khác nhau. Số lượng màn hình và thành phần giao diện có thể tăng lên trong quá trình phát triển. Mô hình Component của React giúp nhóm chia nhỏ giao diện thành các thành phần có trách nhiệm rõ ràng và có khả năng tái sử dụng. 

8 

Ngoài ra, React có thể hoạt động độc lập với Backend thông qua RESTful API. Điều này phù hợp với kiến trúc Client-Server đã xác định, giúp nhóm tách biệt quá trình phát triển giao diện khỏi quá trình xử lý nghiệp vụ. 

Do đó, React được lựa chọn làm công nghệ Frontend vì phù hợp với yêu cầu xây dựng giao diện Web có tính tương tác cao, nhiều thành phần và nhiều nhóm người dùng, đồng thời hỗ trợ tốt sự phân tách giữa Frontend và Backend. 

## **2.2.4 Cơ sở dữ liệu – PostgreSQL** 

PostgreSQL là một hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, hỗ trợ SQL và nhiều cơ chế nhằm bảo đảm tính toàn vẹn, nhất quán và an toàn của dữ liệu. 

Đặc trưng của cơ sở dữ liệu quan hệ là dữ liệu được tổ chức thành các bảng và các bảng có thể liên kết với nhau thông qua khóa chính, khóa ngoại và các ràng buộc. Mô hình này phù hợp với những hệ thống có dữ liệu được tổ chức theo nhiều mối quan hệ rõ ràng. 

Đối với đề tài, dữ liệu có mức độ liên kết cao giữa tài khoản, vai trò, hồ sơ năng lực, tin tuyển dụng, ứng tuyển, dự án, công việc và đánh giá. Các nghiệp vụ của hệ thống cũng yêu cầu dữ liệu giữa nhiều bảng phải duy trì tính nhất quán. Vì vậy, mô hình cơ sở dữ liệu quan hệ là lựa chọn phù hợp. 

PostgreSQL cung cấp cơ chế Transaction, cho phép nhiều thao tác dữ liệu được thực hiện theo một đơn vị xử lý và bảo đảm tính toàn vẹn khi xảy ra lỗi. Đây là đặc điểm quan trọng đối với hệ thống có nhiều nghiệp vụ cập nhật dữ liệu liên quan. 

Ngoài ra, PostgreSQL hỗ trợ các ràng buộc dữ liệu, chỉ mục và khả năng truy vấn dữ liệu có cấu trúc. Những đặc điểm này phù hợp với yêu cầu quản lý và tìm kiếm dữ liệu của nền tảng. 

Vì vậy, PostgreSQL được lựa chọn thay vì một hệ quản trị cơ sở dữ liệu NoSQL trong phạm vi đề tài vì dữ liệu của hệ thống có cấu trúc tương đối rõ ràng, nhiều mối quan hệ và yêu cầu cao về tính nhất quán giữa các đối tượng dữ liệu. 

## **2.2.5 Sự phù hợp của bộ công nghệ** 

Việc lựa chọn công nghệ cho hệ thống được thực hiện dựa trên sự phù hợp giữa đặc điểm lý thuyết của từng công nghệ và yêu cầu thực tế của đề tài. 

9 

Node.js và Express.js đảm nhiệm tầng Backend, phù hợp với yêu cầu xây dựng hệ thống Web có khả năng xử lý API và nhiều hoạt động giao tiếp với Client. 

React đảm nhiệm tầng Frontend, phù hợp với yêu cầu xây dựng giao diện có nhiều thành phần, nhiều màn hình và có mức độ tương tác cao. 

PostgreSQL đảm nhiệm tầng dữ liệu, phù hợp với đặc điểm dữ liệu có cấu trúc và nhiều mối quan hệ, đồng thời yêu cầu tính nhất quán trong quá trình xử lý. 

Ba thành phần này có thể kết hợp với kiến trúc Client-Server và RESTful API để hình thành một hệ thống có sự phân tách tương đối rõ ràng giữa giao diện, xử lý nghiệp vụ và dữ liệu. Đây là cơ sở để hệ thống có thể được phát triển theo từng module, thuận lợi cho việc kiểm thử, bảo trì và mở rộng. 

## **2.3 Công cụ hỗ trợ** 

Bên cạnh các công nghệ trực tiếp tham gia xây dựng hệ thống, quá trình phát triển phần mềm còn cần các công cụ hỗ trợ cho việc quản lý tiến độ, thiết kế giao diện và kiểm soát mã nguồn. Nhóm dự kiến sử dụng ClickUp, Figma và Git. 

## **2.3.1 ClickUp** 

ClickUp là công cụ hỗ trợ quản lý dự án và công việc. Công cụ cho phép tổ chức công việc theo nhiệm vụ, trạng thái, người phụ trách và thời hạn. 

Trong quá trình phát triển đề tài, nhóm phải thực hiện nhiều hoạt động liên quan đến phân tích, thiết kế, lập trình, kiểm thử và hoàn thiện tài liệu. Việc quản lý các công việc này trên một nền tảng tập trung giúp nhóm kiểm soát tiến độ và sự phân công giữa các thành viên. 

ClickUp được lựa chọn vì cung cấp khả năng tổ chức và theo dõi công việc phù hợp với quy trình phát triển phần mềm. Công cụ này giúp nhóm dễ dàng quản lý khối lượng công việc và theo dõi trạng thái của dự án trong suốt quá trình thực hiện. 

## **2.3.2 Figma** 

Figma là công cụ thiết kế giao diện và hỗ trợ xây dựng Prototype cho các sản phẩm số. Figma cho phép nhiều người cùng tham gia thiết kế và trao đổi trên một không gian làm việc thống nhất. 

10 

Đối với hệ thống có nhiều nhóm người dùng và nhiều chức năng, thiết kế UI/UX trước khi lập trình giúp xác định cấu trúc giao diện và luồng tương tác một cách rõ ràng. Điều này giúp hạn chế những thay đổi không cần thiết trong giai đoạn triển khai Frontend. 

Figma được lựa chọn vì đáp ứng tốt nhu cầu thiết kế, chia sẻ và chỉnh sửa giao diện trong môi trường làm việc nhóm. 

## **2.3.3 Git** 

Git là hệ thống quản lý phiên bản phân tán, cho phép theo dõi các thay đổi của mã nguồn trong suốt quá trình phát triển phần mềm. 

Đối với dự án được thực hiện bởi nhiều thành viên, việc quản lý mã nguồn cần bảo đảm mỗi thay đổi đều có thể được theo dõi và kiểm soát. Git hỗ trợ cơ chế Branch, Commit và Merge, giúp nhóm tổ chức quá trình phát triển và kết hợp mã nguồn giữa các thành viên. 

Git được lựa chọn vì đáp ứng yêu cầu quản lý phiên bản và phối hợp phát triển phần mềm theo nhóm. Đồng thời, lịch sử thay đổi của mã nguồn giúp nhóm dễ dàng xác định các thay đổi đã thực hiện và hỗ trợ khôi phục khi cần thiết. 

## **2.3.4 Tổng hợp công nghệ và công cụ dự kiến** 

|**Nhóm**<br>|**Công nghệ/Công cụ**|**Cơ sở lựa chọn**|
|---|---|---|
|Kiến trúc|Client-Server|Phân tách Client và Server, tập trung xử<br>lý nghiệp vụ và dữ liệu|
|Kiến trúc Backend|MVC|Phân tách trách nhiệm giữa dữ liệu, xử<br>lý và giao diện|
|Giao tiếp|RESTful API|Tạo giao diện giao tiếp độc lập giữa<br>Frontend và Backend|
|Phân quyền|RBAC|Phù hợp với hệ thống có nhiều nhóm<br>người dùng và quyền hạn khác nhau|



11 

|Backend|Node.js|Phù hợp với ứng dụng Web và xử lý I/O<br>bất đồng bộ|
|---|---|---|
|Framework<br>Backend|Express.js|Hỗ trợ Routing, Middleware và xây<br>dựng RESTful API|
|Frontend|React|Phù hợp với giao diện Web nhiều<br>Component và có tính tương tác|
|Database|PostgreSQL|Phù hợp với dữ liệu có cấu trúc, nhiều<br>quan hệ và yêu cầu tính nhất quán|
|Quản lý dự án|ClickUp|Theo dõi tiến độ và phân công công<br>việc|
|Thiết kế UI/UX|Figma|Thiết kế và thống nhất giao diện trước<br>khi lập trình|
|Quản lý phiên bản|Git|Theo dõi, kiểm soát và phối hợp mã<br>nguồn|



12 

## **CHƯƠNG 3: PHÂN TÍCH YÊU CẦU** 

## **3.1 Phân tích yêu cầu** 

## **3.1.1 Yêu cầu chức năng** 

## **_Yêu cầu chức năng nghiệp vụ:_** 

**Lưu Trữ:** Hệ thống cho phép lưu trữ và quản lý tập trung thông tin về người dùng (chủ web, nhà tuyển dụng, ứng viên), hồ sơ năng lực chuyên môn, tin tuyển dụng, và dữ liệu của không gian dự án nội bộ. Tất cả dữ liệu được lưu trữ chặt chẽ trong cơ sở dữ liệu quan hệ để đảm bảo tính nhất quán, an toàn và dễ dàng truy xuất. 

**Tra cứu:** Hệ thống cho phép người tìm việc tra cứu tin tuyển dụng và dự án theo nhiều bộ lọc về kỹ năng, mức lương, hình thức làm việc. Nhà tuyển dụng có thể tra cứu và xem chi tiết hồ sơ ứng viên. Quản trị viên có thể tra cứu toàn bộ dữ liệu hệ thống, theo dõi trạng thái ứng tuyển và kiểm tra tiến độ của các hạng mục công việc trong dự án nội bộ một cách thuận tiện. 

**Tính Toán:** Hệ thống tự động tính toán tổng điểm đánh giá năng lực của ứng viên dựa trên kết quả nghiệm thu từ các dự án thực chiến đã hoàn thành. Đồng thời, hệ thống tự động tính toán tỷ lệ hoàn thành dự án dựa trên số lượng công việc được chuyển trạng thái trong bảng Kanban nội bộ, giúp chủ web theo dõi hiệu suất làm việc một cách chính xác. 

**Kết Xuất:** Hệ thống cho phép Quản trị viên kết xuất các loại dữ liệu và báo cáo dưới định dạng PDF, Excel hoặc xem trực tiếp trên giao diện dưới dạng bảng. Các dữ liệu kết xuất bao gồm: danh sách ứng viên trúng tuyển, báo cáo tổng hợp tiến độ dự án nội bộ, và bảng kê trạng thái thanh toán thù lao cho Freelancer. 

## **_Yêu cầu chức năng hệ thống:_** 

**Môi trường:** Ứng dụng web hoạt động tốt và tối ưu trải nghiệm thao tác trên các trình duyệt máy tính phổ biến như Chrome, Edge, Firefox. Hệ thống Backend được phát triển bằng Node.js kết hợp framework Express.js, Frontend xây dựng bằng thư viện React. Cơ sở dữ liệu sử dụng hệ quản trị PostgreSQL. 

13 

## **Phân quyền:** 

**Quản trị viên :** Quản lý toàn bộ hệ thống, bao gồm danh mục kỹ năng, người dùng. Chủ web có toàn quyền khai thác quy trình nội bộ: đăng tin tuyển dự án, đưa ứng viên vào không gian làm việc, phân công công việc, theo dõi tiến độ, nghiệm thu, đánh giá năng lực ứng viên và chi trả thù lao. 

**Nhà tuyển dụng:** Thực hiện các chức năng đăng tin tuyển dụng bên ngoài, tra cứu và khai thác nguồn hồ sơ ứng viên chất lượng, quản lý trạng thái các hồ sơ đã nộp vào doanh nghiệp mình. 

**Người tìm việc:** Thực hiện các chức năng đăng ký, đăng nhập, xây dựng hồ sơ năng lực (Profile IT), tra cứu việc làm và ứng tuyển. Khi tham gia dự án nội bộ của chủ web, ứng viên có quyền tương tác với bảng công việc để nhận task, cập nhật tiến độ và xem điểm đánh giá sau khi hoàn thành. 

## **3.1.2 Yêu cầu phi chức năng** 

## **_Liên quan đến người dùng:_** 

**Tính tiến hóa:** Hệ thống dễ dàng mở rộng để bổ sung thêm các chức năng mới trong tương lai mà không phá vỡ kiến trúc lõi. 

**Tính tiện dụng:** Giao diện trực quan, mang tính tương tác cao và dễ sử dụng cho mọi đối tượng (Quản trị viên, Nhà tuyển dụng, Ứng viên). Đặc biệt, phân hệ không gian làm việc (Workspace) được thiết kế dạng bảng Kanban với thao tác kéo - thả mượt mà, quen thuộc với thói quen của dân công nghệ. 

**Tính hiệu quả:** Dữ liệu về trạng thái công việc (Task) và hồ sơ ứng tuyển được xử lý nhanh chóng. Các thao tác tìm kiếm việc làm, tra cứu hồ sơ ứng viên và kết xuất báo cáo tiến độ được tối ưu hóa truy vấn cơ sở dữ liệu nhằm giảm tối đa độ trễ. 

**Tính tương thích:** Ứng dụng web được tối ưu hóa hiển thị và tương thích tốt nhất trên các thiết bị máy tính cá nhân (PC/Laptop) do đặc thù thao tác nghiệp vụ IT. Hỗ trợ hoạt 

14 

động mượt mà trên đa trình duyệt (Chrome, Edge, Firefox, Safari) và sẵn sàng triển khai trên môi trường điện toán đám mây (Cloud). 

**Tính bảo mật:** Đảm bảo an toàn tuyệt đối cho thông tin cá nhân và dữ liệu dự án nội bộ của doanh nghiệp. Hệ thống mã hóa mật khẩu, áp dụng cơ chế xác thực JWT và phân quyền (RBAC) chặt chẽ, đảm bảo nhóm Nhà tuyển dụng đối tác không thể truy cập vào phân hệ Workspace của Quản trị viên. 

## **_Liên quan đến chuyên viên tin học:_** 

**Tính tái sử dụng:** Mã nguồn được thiết kế theo tư tưởng module hóa, tách biệt hoàn toàn giữa luồng xử lý giao diện, nghiệp vụ máy chủ và lưu trữ dữ liệu. Các Component giao diện và hệ thống RESTful API được xây dựng độc lập, có thể dễ dàng tái sử dụng hoặc mở rộng cho các hệ thống quản trị nhân sự hay quản lý dự án khác trong tương lai. 

## **3.2 Lập danh sách yêu cầu** 

## **3.2.1 Bảng yêu cầu chức năng nghiệp vụ** 

3.2.1.1. Bộ phận (người thực hiện): Quản trị viên (Quản trị viên/ Quản trị dự án) 

_Bảng yêu cầu chức năng nghiệp vụ của Quản trị viên_ 

|**STT**|**Công việc**|**Loại công**<br>**việc**|**Quy định/Công thức liên**<br>**quan**|**Biểu mẫu**<br>**liên quan**|**Ghi chú**|
|---|---|---|---|---|---|
|**1**|**Quản lý**<br>**danh mục**<br>**dùng chung**|**Lưu trữ**|**- Tạo, sửa, xóa danh mục**<br>**kỹ năng.**|||
|**2**|**Quản lý**<br>**người dùng**<br>**hệ thống**|**Lưu trữ**|**- Khóa/Mở khóa tài**<br>**khoản, phân quyền truy**<br>**cập.**<br>**- Kiểm tra và xác thực tài**<br>**khoản doanh nghiệp đối**<br>**tác.**||**Đảm bảo tính**<br>**bảo mật và**<br>**uy tín của**<br>**nền tảng.**|



15 

|**3**|**Quản lý tin**<br>**tuyển dụng**<br>**nội bộ**|**Lưu trữ**|**- Tạo tin đăng dự án, thiết**<br>**lập yêu cầu kỹ năng, ngân**<br>**sách.**<br>**- Duyệt tin tuyển dụng**<br>**- Duyệt hồ sơ ứng viên**<br>**nộp vào dự án nội bộ.**|**Hiển thị ưu**<br>**tiên trên**<br>**trang chủ.**|
|---|---|---|---|---|
|**4**|**Quản lý**<br>**Không gian**<br>**làm việc**<br>**(Workspace**<br>**)**|**Lưu trữ**|**- Khởi tạo Workspace cho**<br>**dự án mới.**<br>**- Thêm ứng viên trúng**<br>**tuyển vào không gian làm**<br>**việc.**||
|**5**|**Phân công**<br>**và kiểm**<br>**soát tiến độ**|**Lưu trữ**|**- Tạo hạng mục công việc**<br>**(Task).**<br>**- Gán người thực hiện,**<br>**đặt Deadline.**<br>**- Thay đổi trạng thái Task.**|**Liên kết trực**<br>**tiếp với**<br>**luồng thao**<br>**tác của ứng**<br>**viên.**|
|**6**|**Nghiệm thu**<br>**và đánh giá**<br>**năng lực**|**Lưu trữ**|**- Nghiệm thu công việc**<br>**hoàn thành.**<br>**- Chấm điểm , nhập nhận**<br>**xét hiệu suất làm việc.**|**Kết quả lưu**<br>**vào hồ sơ**<br>**năng lực của**<br>**ứng viên.**|
|**7**|**Thanh toán**<br>**trả lương**<br>**dự án**|**Lưu trữ**|**- Thực hiện thanh toán**<br>**lương/thù lao cho ứng**<br>**viên thông qua hệ thống**<br>**cổng thanh toán.**<br>**- Tự động cập nhật trạng**<br>**thái "Đã thanh toán".**|**Tích hợp API**<br>**cổng thanh**<br>**toán điện tử**<br>**(VNPay/Ngân**<br>**hàng).**|
|**8**|**Báo cáo**<br>**thống kê**<br>**tổng quan**|**Kết xuất**|**- Thống kê số lượng hồ**<br>**sơ, tiến độ dự án, doanh**<br>**nghiệp đối tác, báo cáo**<br>**chi phí trả lương.**<br>**- Xuất dữ liệu thống kê.**|**Có thể kết**<br>**xuất ra định**<br>**dạng Excel**<br>**hoặc PDF.**|



16 

## 3.2.1.2. Bộ phận (người thực hiện): Người tìm việc (Ứng viên / Freelancer) 

_Bảng yêu cầu chức năng nghiệp vụ Người tìm việc_ 

|**STT**|**Công việc**|**Loại**<br>**công**<br>**việc**|**Quy định/Công thức liên quan**|**Biểu**<br>**mẫu**<br>**liên**<br>**quan**|**Ghi chú**|
|---|---|---|---|---|---|
|**1**|**Đăng nhập/**<br>**Đăng ký/**<br>**Quên mật**<br>**khẩu**|**Lưu trữ**|**- Nhập thông tin bắt buộc:**<br>**Email, Họ tên, Mật khẩu.**<br>**- Xác thực tài khoản qua email**<br>**(OTP/Link).**<br>**- Mã hóa mật khẩu trước khi**<br>**lưu trữ vào CSDL.**||**Yêu cầu bắt**<br>**buộc để sử**<br>**dụng hệ**<br>**thống.**|
|**2**|**Quản lý Hồ sơ**<br>**năng lực cá**<br>**nhân**|**Lưu trữ**|**- Cập nhật thông tin cá nhân, kỹ**<br>**năng IT, kinh nghiệm, link**<br>**GitHub/Portfolio…**<br>**- Quy định: Điểm đánh giá thực**<br>**chiến và lịch sử dự án nội bộ là**<br>**trường dữ liệu Read-only, do**<br>**hệ thống tự động cập nhật, ứng**<br>**viên không thể tự sửa đổi.**|||
|**3**|**Tra cứu việc**<br>**làm và dự án**|**Tra cứu**|**- Tìm kiếm tin tuyển dụng theo**<br>**từ khóa, danh mục kỹ năng,**<br>**mức lương, hoặc hình thức**<br>**(Remote, Freelance), địa điểm,**<br>**…**<br>**- Phân loại rõ tin của Quản trị**<br>**viên (Dự án nội bộ) và tin của**<br>**Đối tác.**|||



17 

|**4**|**Ứng tuyển**<br>**công việc**|**Lưu trữ**|**- Chọn trích xuất Profile IT từ**<br>**hệ thống.**<br>**- Đính kèm thư ngỏ (Cover**<br>**Letter) hoặc file CV phụ.**<br>**- Hệ thống tự động chuyển**<br>**trạng thái hồ sơ sang "Chờ**<br>**duyệt".**||
|---|---|---|---|---|
|**5**|**Quản lý tiến**<br>**độ công việc**<br>**cá nhân**|**Lưu trữ**|**- Điều kiện: Chỉ mở khi ứng**<br>**viên trúng tuyển dự án nội bộ**<br>**của Quản trị viên.**<br>**- Thao tác kéo/thả trạng thái**<br>**thẻ công việc (To do, Doing,**<br>**Done).**<br>**- Cập nhật % hoàn thành và**<br>**đính kèm link/file sản phẩm**<br>**giao nộp.**|**Phân hệ**<br>**tương tác**<br>**trực tiếp**<br>**với Quản**<br>**trị viên.**|
|**6**|**Xem đánh giá**<br>**và trạng thái**<br>**thù lao**|**Tra cứu**|**- Tra cứu điểm số, nhận xét từ**<br>**Quản trị dự án sau khi công**<br>**việc được nghiệm thu.**<br>**- Kiểm tra trạng thái thanh toán**<br>**(Đang xử lý, Đã thanh toán) cho**<br>**các dự án đã hoàn tất.**||



## 3.2.1.3. Bộ phận (người thực hiện): Nhà tuyển dụng 

_Bảng yêu cầu chức năng nghiệp vụ Nhà tuyển dụng_ 

|**STT**|**Công việc**|**Loại**|**Quy định/Công thức liên quan**|**Biểu**|**Ghi chú**|
|---|---|---|---|---|---|
|||**công**||**mẫu**||
|||**việc**||**liên**||
|||||**quan**||
|**1**|**Đăng ký tài**|**Lưu trữ**|**- Khai báo thông tin công ty, địa**||**Đảm bảo**|



18 

||**khoản doanh**<br>**nghiệp**||**chỉ, mã số thuế.**<br>**- Quy định: Tài khoản cần được**<br>**Admin duyệt hoặc xác thực qua**<br>**email doanh nghiệp trước khi**<br>**được phép đăng tin.**|**tính xác**<br>**thực của**<br>**đối tác.**|
|---|---|---|---|---|
|**2**|**Quản lý tin**<br>**tuyển dụng**|**Lưu trữ**|**- Thêm, sửa, ẩn hoặc đóng tin**<br>**tuyển dụng.**<br>**- Khai báo rõ yêu cầu kỹ năng,**<br>**mức lương, số lượng cần**<br>**tuyển.**<br>**- Quy định: Tin hết hạn sẽ tự**<br>**động chuyển sang trạng thái**<br>**"Đóng".**|**Luồng dữ**<br>**liệu hoàn**<br>**toàn độc**<br>**lập với dự**<br>**án nội bộ.**|
|**3**|**Tra cứu và**<br>**Sàng lọc ứng**<br>**viên**|**Tra cứu**|**- Tìm kiếm ứng viên theo bộ lọc**<br>**kỹ năng, số năm kinh nghiệm.**<br>**- Quy định: Cho phép lọc ưu**<br>**tiên các ứng viên có Điểm năng**<br>**lực  cao trên hệ thống.**|**Tận dụng**<br>**nguồn dữ**<br>**liệu ứng**<br>**viên đã**<br>**được xác**<br>**thực.**|
|**4**|**Quản lý luồng**<br>**hồ sơ ứng**<br>**tuyển**|**Lưu trữ**|**- Xem chi tiết hồ sơ ứng viên đã**<br>**nộp vào tin của công ty.**<br>**- Cập nhật trạng thái xử lý hồ**<br>**sơ (Chờ duyệt, Đã xem, Phỏng**<br>**vấn, Trúng tuyển, Từ chối).**<br>**- Gửi thông báo tự động cập**<br>**nhật trạng thái cho ứng viên.**||
|**5**|**Thống kê hiệu**<br>**quả tuyển**<br>**dụng**|**Kết**<br>**xuất**|**- Thống kê số lượng lượt xem**<br>**tin đăng, số lượng CV ứng**<br>**tuyển theo từng chiến dịch.**<br>**- Kết xuất danh sách ứng viên**<br>**theo định dạng Excel/PDF.**||



19 

## **3.2.2 Bảng yêu cầu chức năng hệ thống** 

_Bảng yêu cầu chức năng hệ thống_ 

|**STT**|**Nội dung**|**Mô tả chi tiết**|**Ghi chú**|
|---|---|---|---|
|**1**|**Phân quyền**<br>**người dùng**|**Hệ thống quản lý quyền truy cập và chức**<br>**năng của từng loại tài khoản.**<br>**- Người tìm việc: Đăng ký, đăng nhập, tạo**<br>**hồ sơ, ứng tuyển, nhận việc, cập nhật**<br>**tiến độ, xem đánh giá.**<br>**- Nhà tuyển dụng: Đăng ký, đăng nhập,**<br>**quản lý tin tuyển dụng đối tác, tìm kiếm**<br>**và duyệt hồ sơ.**<br>**- Quản trị viên (Admin): Toàn quyền quản**<br>**lý hệ thống, quản lý dự án nội bộ, đánh**<br>**giá nhân sự và thực hiện chi trả lương.**|**Quy định quyền**<br>**truy cập theo vai trò**<br>**(RBAC).**|
|**2**|**Tính toán,**<br>**thống kê dữ**<br>**liệu**|**Hệ thống tự động thống kê và tính toán**<br>**dữ liệu dự án theo thời gian thực.**<br>**- Thống kê điểm số đánh giá, tính toán tỷ**<br>**lệ hoàn thành Task của ứng viên.**<br>**- Tổng hợp số lượng tin đăng, hồ sơ ứng**<br>**tuyển, và tổng chi phí trả lương của dự**<br>**án.**<br>**- Xuất báo cáo dạng bảng hỗ trợ quản trị**<br>**viên theo dõi hiệu quả.**|**Chức năng của**<br>**Quản trị viên.**|
|**3**|**Tích hợp**<br>**thanh toán**<br>**trực tuyến**|**Hệ thống tích hợp cổng thanh toán trực**<br>**tuyến để Quản trị viên có thể thao tác trả**<br>**lương trực tiếp cho Freelancer/Người**<br>**tìm việc ngay trên nền tảng sau khi**<br>**nghiệm thu dự án.**||
|**4**|**Lưu trữ, sao**|**Hệ thống tự động lưu trữ dữ liệu định**|**Chức năng nội bộ**|



20 

|**lưu, backup và**|**kỳ, bao gồm thông tin người dùng, hồ sơ**|**hệ thống.**|
|---|---|---|
|**phục hồi dữ**|**IT, dự án, lịch sử đánh giá và lịch sử giao**||
|**liệu**|**dịch thanh toán.**<br>**- Thực hiện sao lưu tự động theo chu kỳ.**<br>**- Đảm bảo tính toàn vẹn và an toàn của**<br>**thông tin tài chính và hồ sơ.**||



## **3.2.3 Bảng yêu cầu về chất lượng** 

_Bảng yêu cầu về chất lượng_ 

|**STT**|**Nội Dung**|**Tiêu chuẩn**|**Mô tả chi tiết**|**Ghi**<br>**chú**|
|---|---|---|---|---|
|**1**|**Giao diện thân**<br>**thiện với người**<br>**dùng**|**Thân thiện,**<br>**tiện lợi, dễ**<br>**dùng**|**Màn hình trực quan, đầy đủ tính**<br>**năng thao tác theo yêu cầu. Bảng**<br>**tiến độ hỗ trợ thao tác kéo-thả**<br>**mượt mà, tối ưu cho đặc thù công**<br>**việc IT.**||
|**2**|**Đảm bảo bảo mật**|**Tin cậy, bảo**<br>**mật**|**Đảm bảo người dùng sử dụng đúng**<br>**quyền. Bảo vệ nghiêm ngặt thông**<br>**tin hồ sơ ứng viên, dữ liệu dự án**<br>**nội bộ và đặc biệt là an toàn thông**<br>**tin giao dịch thanh toán lương.**||
|**3**|**Khả năng mở rộng**<br>**hệ thống**|**Tiến hóa**|**Mã nguồn được thiết kế module**<br>**hóa, dễ dàng bổ sung thêm các tính**<br>**năng mới (Video Call phỏng vấn,**<br>**Chat nội bộ) hoặc tích hợp thêm**<br>**nhiều cổng thanh toán khác.**||
|**4**|**Tốc độ xử lý**<br>**nghiệp vụ nhanh**|**Hiệu quả**|**Tốc độ xử lý và gửi yêu cầu nhanh**<br>**chóng. Các thao tác cập nhật tiến**<br>**độ công việc, tìm kiếm hồ sơ và**<br>**phản hồi từ API thanh toán diễn ra**||



21 

### **với độ trễ thấp nhất.** 

## **3.3 Mô hình hóa yêu cầu** 

## **3.3.1 Nhận diện tác nhân và chức năng trong sơ đồ usecase** 

|**STT**|**Tác Nhân**|**Chức năng**|
|---|---|---|
|**1**|**Người tìm việc (Ứng**<br>**viên / Freelancer)**|-Đăng ký tài khoản<br>-Đăng nhập<br>-Quên mật khẩu<br>-Quản lý hồ sơ năng lực cá nhân<br>-Cập nhật thông tin cá nhân, kỹ năng, kinh nghiệm<br>-Tra cứu việc làm và dự án<br>- Xem chi tiết tin tuyển dụng<br>- Ứng tuyển công việc<br>- Theo dõi trạng thái hồ sơ ứng tuyển<br>- Xem và quản lý Task trong dự án nội bộ<br>- Cập nhật tiến độ công việc|
|**2**|**Nhà tuyển dụng (Đối**<br>**tác bên ngoài)**|-Đăng ký tài khoản doanh nghiệp<br>- Đăng nhập<br>- Quản lý thông tin doanh nghiệp<br>- Quản lý tin tuyển dụng<br>- Tra cứu và tìm kiếm ứng viên<br>- Quản lý hồ sơ ứng tuyển|
|**3**|**Quản trị viên (Chủ**<br>**web / Quản trị dự án)**|-Đăng nhập<br>- Quản lý tài khoản người dùng<br>- Khóa / mở khóa tài khoản<br>- Phân quyền người dùng<br>- Xác thực tài khoản doanh nghiệp<br>- Quản lý danh mục kỹ năng<br>- Quản lý tin tuyển dụng nội bộ<br>- Tạo tin đăng dự án<br>- Duyệt tin tuyển dụng|



22 



<!-- Start of picture text -->
- Duyệt hồ sơ ứng viên<br>- Quản lý Workspace của dự án<br>- Thêm ứng viên trúng tuyển vào Workspace<br>- Tạo và quản lý Task<br>- Nghiệm thu công việc<br>- Đánh giá năng lực ứng viên<br>- Thanh toán thù lao cho ứng viên<br>- Kết xuất báo cáo Excel/PDF<br><!-- End of picture text -->

## **3.3.2 Sơ đồ usecase** 



<!-- Start of picture text -->
6g nin Sanh aR<br>"Khoa<br>-<einctudes> / mekoa ta Khoa <<include>>..~<br><ceena>> (Gun<br>ent i<br>“<<include>> ‘Khai bao yéu edu tuyén dung<br>"a ha dn oan rip<br>; 5<br>‘Quin danh mvs Ring”) ~-<<nte>>- Fao [aTa09) obitde<br>uy nang nan sens cI ‘Gai thong bao cho tng vién)*~<<inctude>><br>: Tp yu ca ig ve ng ach<br>‘euten>a -<snouse>> rongkd yin dg<br>sees<br>/ Cain<br>a a eects gn<br>‘ap mating ca my nna nn neh.ters<br>9 <cretens ies COLCA<br>cnc Hem en win tying OMI<br>Theo atin dan TEEEEEE<br>(Gap mat % Hoan tanh )<cextence> »(— Cap nha ten 6<br>'Nghiém thu cong vec iy dBi trang thal Tas inciude>>. <dir>‘ Pa Caan Wy T ase k oya an °<br>‘Banh gia nang We Ung Vien )~-<cincude>> (Chap am va nha x ccentehe>’ 9 in<br>{Thanh toa th a0) <cineude>> ‘Theo trang thal han toan<br>ccipeysessX Tg 8 9 ng wen(ea ‘Ung tuyéncong viee<br><chcusen> “TENG<br><cncut>> (TgHE. annBa) rap be Seater»<br>noes<br><cite><br>ee<br><!-- End of picture text -->

23 

## **3.3.3 Đặc tả usecase** 

3.3.3.1. Đặc tả Use Case Quản lý tài khoản 

## **Mô tả** 

Chức năng cho phép Người tìm việc đăng ký tài khoản, đăng nhập vào hệ thống và thực hiện khôi phục mật khẩu khi quên mật khẩu. Hệ thống thực hiện kiểm tra tính hợp lệ của thông tin tài khoản và xác thực người dùng trước khi cho phép truy cập các chức năng của hệ thống. 

Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

- Người dùng chưa đăng nhập hoặc đang ở giao diện đăng nhập. 

- Người dùng có đầy đủ thông tin cần thiết để đăng ký hoặc đăng nhập. 

- Hệ thống và cơ sở dữ liệu đang hoạt động bình thường. 

## **Tình huống chính: Đăng nhập thành công** 

1.  Người dùng chọn chức năng "Đăng nhập". 

2.  Hệ thống hiển thị biểu mẫu đăng nhập. 

3.  Người dùng nhập Email và Mật khẩu. 

4.  Người dùng nhấn nút "Đăng nhập". 

5.  Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 

6.  Hệ thống xác thực thông tin tài khoản trong cơ sở dữ liệu. 

7.  Hệ thống tạo phiên đăng nhập cho người dùng. 

8.  Hệ thống chuyển người dùng đến Trang chủ. 

9.  Kết thúc chức năng đăng nhập. 

## **Các tình huống thay thế** 

a) Đăng nhập thất bại do thông tin không chính xác 

   1.  Hệ thống phát hiện Email hoặc Mật khẩu không chính xác. 

   2.  Hệ thống hiển thị thông báo "Email hoặc mật khẩu không chính xác". 

   3.  Người dùng thực hiện nhập lại thông tin. 

- b) Đăng nhập thất bại do tài khoản bị khóa 

   1.  Hệ thống phát hiện tài khoản đang ở trạng thái bị khóa. 

   2.  Hệ thống hiển thị thông báo tài khoản đã bị khóa. 

24 

   3.  Kết thúc chức năng đăng nhập. 

- c) Người dùng quên mật khẩu 

   1.  Người dùng chọn chức năng "Quên mật khẩu". 

   2.  Hệ thống chuyển sang chức năng khôi phục mật khẩu. 

   3.  Hệ thống thực hiện Use Case "Quên mật khẩu". 

- d) Đăng ký tài khoản thất bại do Email đã tồn tại 

   1.  Người dùng nhập thông tin đăng ký. 

   2.  Hệ thống phát hiện Email đã tồn tại trong hệ thống. 

   3.  Hệ thống hiển thị thông báo Email đã được sử dụng. 

   4.  Kết thúc chức năng đăng ký tài khoản. 

- 3.3.3.2. Đặc tả Use Case Quản lý hồ sơ năng lực 

## **Mô tả** 

Chức năng cho phép Người tìm việc quản lý hồ sơ năng lực cá nhân, bao gồm cập nhật thông tin cá nhân, kỹ năng, kinh nghiệm và thêm liên kết GitHub / Portfolio. Hồ sơ được sử dụng làm cơ sở để giới thiệu năng lực với Nhà tuyển dụng. 

Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

- Người tìm việc đã đăng nhập thành công. 

- Tài khoản người dùng đang ở trạng thái hoạt động. 

- Hệ thống kết nối được với cơ sở dữ liệu. 

## **Tình huống chính: Cập nhật hồ sơ thành công** 

1.  Người tìm việc chọn chức năng "Quản lý hồ sơ năng lực". 

2.  Hệ thống hiển thị thông tin hồ sơ hiện tại. 

3.  Người tìm việc nhập hoặc chỉnh sửa thông tin cá nhân. 

4.  Người tìm việc cập nhật kỹ năng và kinh nghiệm. 

5.  Người tìm việc có thể thêm GitHub / Portfolio. 

6.  Người tìm việc nhấn nút "Lưu". 

7.  Hệ thống xác thực dữ liệu đầu vào. 

8.  Hệ thống lưu thông tin hồ sơ vào cơ sở dữ liệu. 

9.  Hệ thống hiển thị thông báo cập nhật hồ sơ thành công. 

25 

10. Kết thúc chức năng quản lý hồ sơ năng lực. 

## **Các tình huống thay thế** 

- a) Cập nhật hồ sơ thất bại do dữ liệu không hợp lệ 

   1.  Hệ thống phát hiện thông tin bắt buộc bị bỏ trống hoặc sai định dạng. 

   2.  Hệ thống hiển thị thông báo dữ liệu không hợp lệ. 

   3.  Người dùng nhập lại thông tin. 

- b) Cập nhật hồ sơ thất bại do liên kết không hợp lệ 

   1.  Hệ thống phát hiện liên kết GitHub / Portfolio không đúng định dạng. 

   2.  Hệ thống hiển thị thông báo liên kết không hợp lệ. 

   3.  Kết thúc chức năng. 

- c) Người dùng hủy cập nhật 

   1.  Người dùng nhấn nút "Hủy bỏ". 

   2.  Hệ thống xóa dữ liệu tạm thời và giữ nguyên hồ sơ hiện tại. 

   3.  Kết thúc chức năng quản lý hồ sơ năng lực. 

- 3.3.3.3. Đặc tả Use Case Tra cứu việc làm / dự án 

## **Mô tả** 

Chức năng cho phép Người tìm việc tìm kiếm các tin tuyển dụng và dự án phù hợp với năng lực. Hệ thống hỗ trợ tìm kiếm theo từ khóa, lọc theo kỹ năng, mức lương, hình thức làm việc và địa điểm, đồng thời cho phép xem chi tiết tin tuyển dụng. Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

Người tìm việc đã đăng nhập. 

Hệ thống có dữ liệu tin tuyển dụng / dự án. 

Chức năng tìm kiếm đang hoạt động. 

## **Tình huống chính: Tra cứu thành công** 

1.  Người tìm việc chọn chức năng "Tra cứu việc làm / dự án". 

2.  Hệ thống hiển thị danh sách tin tuyển dụng. 

3.  Người tìm việc nhập từ khóa tìm kiếm. 

4.  Người tìm việc thiết lập các tiêu chí lọc. 

5.  Hệ thống xử lý yêu cầu tìm kiếm. 

26 

6.  Hệ thống hiển thị danh sách kết quả phù hợp. 

7.  Người tìm việc chọn một tin tuyển dụng. 

8.  Hệ thống hiển thị thông tin chi tiết tin tuyển dụng. 

9.  Kết thúc chức năng tra cứu. 

**Các tình huống thay thế** 

- a) Không tìm thấy kết quả 

   1.  Hệ thống không tìm thấy tin tuyển dụng phù hợp. 

   2.  Hệ thống hiển thị thông báo "Không tìm thấy công việc phù hợp". 

   3.  Kết thúc chức năng. 

- b) Tiêu chí lọc không hợp lệ 

   1.  Hệ thống phát hiện mức lương hoặc tiêu chí lọc không hợp lệ. 

   2.  Hệ thống hiển thị thông báo yêu cầu kiểm tra lại. 

   3.  Kết thúc chức năng. 

- 3.3.3.4. Đặc tả Use Case Ứng tuyển công việc 

## **Mô tả** 

Chức năng cho phép Người tìm việc gửi hồ sơ ứng tuyển vào một tin tuyển dụng đang hoạt động. Hệ thống hỗ trợ đính kèm CV / Cover Letter, kiểm tra điều kiện ứng tuyển và lưu hồ sơ ứng tuyển để Nhà tuyển dụng xử lý. 

Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

- Người tìm việc đã đăng nhập. 

- Tin tuyển dụng đang ở trạng thái nhận hồ sơ. 

- Người tìm việc chưa ứng tuyển vào tin tuyển dụng này. 

## **Tình huống chính: Ứng tuyển thành công** 

1.  Người tìm việc chọn một tin tuyển dụng. 

2.  Hệ thống hiển thị chi tiết tin tuyển dụng. 

3.  Người tìm việc nhấn nút "Ứng tuyển". 

4.  Hệ thống hiển thị biểu mẫu ứng tuyển. 

5.  Người tìm việc nhập Cover Letter. 

6.  Người tìm việc đính kèm CV. 

27 

7.  Hệ thống thực hiện Use Case bao gộp: Kiểm tra hồ sơ ứng tuyển. 

8.  Người tìm việc nhấn nút "Gửi hồ sơ". 

9.  Hệ thống lưu hồ sơ ứng tuyển vào cơ sở dữ liệu. 

10. Hệ thống thiết lập trạng thái hồ sơ là "Chờ duyệt". 

11. Hệ thống hiển thị thông báo ứng tuyển thành công. 

12. Kết thúc chức năng ứng tuyển. 

## **Các tình huống thay thế** 

- a) Ứng tuyển thất bại do tin tuyển dụng đã đóng 

   1.  Hệ thống phát hiện tin tuyển dụng không còn nhận hồ sơ. 

   2.  Hệ thống hiển thị thông báo tin tuyển dụng đã đóng. 

   3.  Kết thúc chức năng. 

- b) Ứng tuyển thất bại do hồ sơ không hợp lệ 

   1.  Hệ thống phát hiện CV sai định dạng hoặc thiếu thông tin bắt buộc. 

   2.  Hệ thống hiển thị thông báo hồ sơ không hợp lệ. 

   3.  Kết thúc chức năng. 

- c) Ứng viên đã ứng tuyển trước đó 

   1.  Hệ thống phát hiện ứng viên đã có hồ sơ ứng tuyển cho tin tuyển dụng này. 

   2.  Hệ thống hiển thị thông báo đã ứng tuyển trước đó. 

   3.  Kết thúc chức năng. 

- d) Người tìm việc hủy ứng tuyển 

   1.  Người tìm việc nhấn nút "Hủy bỏ". 

   2.  Hệ thống xóa dữ liệu tạm thời trên biểu mẫu. 

   3.  Kết thúc chức năng ứng tuyển. 

- 3.3.3.5. Đặc tả Use Case Theo dõi hồ sơ ứng tuyển 

## **Mô tả** 

Chức năng cho phép Người tìm việc theo dõi tình trạng xử lý của các hồ sơ ứng tuyển. Hệ thống hiển thị trạng thái hiện tại và lịch sử xử lý của từng hồ sơ. Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

- Người tìm việc đã đăng nhập. 

28 

- Người tìm việc đã có ít nhất một hồ sơ ứng tuyển. 

## **Tình huống chính: Xem trạng thái hồ sơ thành công** 

1.  Người tìm việc chọn chức năng "Theo dõi hồ sơ ứng tuyển". 

2.  Hệ thống hiển thị danh sách hồ sơ đã ứng tuyển. 

3.  Người tìm việc chọn một hồ sơ. 

4.  Hệ thống hiển thị trạng thái hiện tại. 

5.  Hệ thống hiển thị lịch sử thay đổi trạng thái. 

6.  Kết thúc chức năng. 

**Các tình huống thay thế** 

a) Không có hồ sơ ứng tuyển 

**1.  Hệ thống phát hiện người dùng chưa có hồ sơ ứng tuyển.** 

**2.  Hệ thống hiển thị thông báo chưa có hồ sơ.** 

**3.  Kết thúc chức năng.** 

- 3.3.3.6. Đặc tả Use Case Quản lý Task dự án 

## **Mô tả** 

Chức năng cho phép Người tìm việc xem và cập nhật các Task được phân công trong Workspace dự án. Người dùng có thể cập nhật tiến độ, thay đổi trạng thái Task, cập nhật phần trăm hoàn thành và đính kèm sản phẩm. 

Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). 

## **Điều kiện trước** 

- Người tìm việc đã đăng nhập. 

- Người tìm việc đã được thêm vào Workspace. 

- Người tìm việc đã được phân công Task. 

## **Tình huống chính: Cập nhật Task thành công** 

1.  Người tìm việc mở Workspace dự án. 

2.  Hệ thống hiển thị danh sách Task được phân công. 

3.  Người tìm việc chọn Task cần cập nhật. 

4.  Người tìm việc cập nhật tiến độ. 

5.  Người tìm việc thay đổi trạng thái Task. 

6.  Người tìm việc cập nhật % hoàn thành. 

29 

7.  Người tìm việc có thể đính kèm link / file sản phẩm. 

8.  Người tìm việc nhấn nút "Lưu". 

9.  Hệ thống kiểm tra dữ liệu. 

10. Hệ thống cập nhật Task. 

11. Hệ thống cập nhật tiến độ dự án. 

12. Hệ thống hiển thị thông báo cập nhật thành công. 

13. Kết thúc chức năng quản lý Task. 

## **Các tình huống thay thế** 

- a) Cập nhật thất bại do % hoàn thành không hợp lệ 

   1.  Hệ thống phát hiện phần trăm hoàn thành nhỏ hơn 0 hoặc lớn hơn 100. 

   2.  Hệ thống hiển thị thông báo dữ liệu không hợp lệ. 

   3.  Kết thúc chức năng. 

- b) File sản phẩm không hợp lệ 

   1.  Hệ thống phát hiện file vượt quá dung lượng hoặc sai định dạng. 

   2.  Hệ thống hiển thị thông báo không thể đính kèm file. 

   3.  Kết thúc chức năng. 

- c) Người tìm việc hủy cập nhật 

   1.  Người tìm việc nhấn "Hủy bỏ". 

   2.  Hệ thống xóa dữ liệu tạm thời. 

   3.  Kết thúc chức năng. 

- 3.3.3.7. Đặc tả Use Case Theo dõi đánh giá và thanh toán 

## **Mô tả** 

Chức năng cho phép Người tìm việc xem điểm đánh giá năng lực, nhận xét sau khi hoàn thành công việc và trạng thái thanh toán thù lao. 

Actor sử dụng chức năng này là: Người tìm việc (Ứng viên / Freelancer). Điều kiện trước 

- Người tìm việc đã đăng nhập. 

   - Người dùng đã có kết quả đánh giá hoặc giao dịch thanh toán. 

## **Tình huống chính** 

1.  Người tìm việc chọn chức năng "Đánh giá và thanh toán". 

30 

2.  Hệ thống hiển thị điểm đánh giá năng lực. 

3.  Hệ thống hiển thị nhận xét của Quản trị viên. 

4.  Hệ thống hiển thị trạng thái thanh toán. 

5.  Người tìm việc xem thông tin chi tiết. 

6.  Kết thúc chức năng. 

## **Các tình huống thay thế** 

a) Chưa có kết quả đánh giá 

   1.  Hệ thống phát hiện chưa có đánh giá. 

   2.  Hệ thống hiển thị thông báo chưa có kết quả đánh giá. 

- b) Chưa có thông tin thanh toán 

   1.  Hệ thống phát hiện chưa phát sinh khoản thanh toán. 

   2.  Hệ thống hiển thị thông báo chưa có thông tin thanh toán. 

- 3.3.3.8. Đặc tả Use Case Quản lý tài khoản doanh nghiệp 

## **Mô tả** 

Chức năng cho phép Nhà tuyển dụng đăng ký tài khoản doanh nghiệp, đăng nhập và quản lý thông tin doanh nghiệp. 

Actor sử dụng chức năng này là: Nhà tuyển dụng (Đối tác bên ngoài). 

## **Điều kiện trước** 

Nhà tuyển dụng chưa đăng nhập hoặc đã có tài khoản doanh nghiệp. Hệ thống hoạt động bình thường. 

## **Tình huống chính** 

1.  Nhà tuyển dụng chọn "Đăng ký tài khoản doanh nghiệp". 

2.  Hệ thống hiển thị biểu mẫu đăng ký. 

3.  Nhà tuyển dụng nhập thông tin doanh nghiệp. 

4.  Hệ thống kiểm tra dữ liệu. 

5.  Hệ thống tạo tài khoản doanh nghiệp. 

6.  Nhà tuyển dụng đăng nhập. 

7.  Nhà tuyển dụng chọn "Quản lý thông tin doanh nghiệp". 

8.  Hệ thống hiển thị thông tin doanh nghiệp. 

9.  Nhà tuyển dụng cập nhật thông tin. 

31 

10. Hệ thống lưu thay đổi. 

11. Kết thúc chức năng. 

## **Các tình huống thay thế** 

a) Đăng ký thất bại do thông tin đã tồn tại 

   1.  Hệ thống phát hiện tài khoản doanh nghiệp đã tồn tại. 

   2.  Hệ thống hiển thị thông báo lỗi. 

   3.  Kết thúc chức năng. 

- b) Thông tin doanh nghiệp không hợp lệ 

   1.  Hệ thống phát hiện dữ liệu thiếu hoặc sai định dạng. 

   2.  Hệ thống yêu cầu nhập lại. 

- 3.3.3.9. Đặc tả Use Case Quản lý tin tuyển dụng 

## **Mô tả** 

Chức năng cho phép Nhà tuyển dụng tạo, chỉnh sửa và đóng các tin tuyển dụng của doanh nghiệp. Tin tuyển dụng bao gồm thông tin công việc, kỹ năng yêu cầu, mức lương và số lượng cần tuyển. 

Actor sử dụng chức năng này là: Nhà tuyển dụng (Đối tác bên ngoài). 

## **Điều kiện trước** 

- Nhà tuyển dụng đã đăng nhập. 

- Tài khoản doanh nghiệp đang hoạt động. 

## **Tình huống chính: Tạo tin tuyển dụng thành công** 

1.  Nhà tuyển dụng chọn chức năng "Quản lý tin tuyển dụng". 

2.  Hệ thống hiển thị danh sách tin hiện có. 

3.  Nhà tuyển dụng chọn "Thêm tin tuyển dụng". 

4.  Hệ thống hiển thị biểu mẫu. 

5.  Nhà tuyển dụng nhập tiêu đề, mô tả, kỹ năng, mức lương, địa điểm và số lượng tuyển. 

6.  Nhà tuyển dụng nhấn "Lưu". 

7.  Hệ thống xác thực dữ liệu. 

8.  Hệ thống lưu tin tuyển dụng. 

9.  Hệ thống hiển thị thông báo tạo tin thành công. 

32 

10. Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Dữ liệu tin tuyển dụng không hợp lệ 

   1.  Hệ thống phát hiện thiếu thông tin bắt buộc. 

   2.  Hệ thống hiển thị thông báo lỗi. 

   3.  Kết thúc chức năng. 

- b) Nhà tuyển dụng đóng tin 

   1.  Nhà tuyển dụng chọn một tin tuyển dụng đang hoạt động. 

   2.  Nhà tuyển dụng chọn "Ẩn / đóng tin". 

   3.  Hệ thống hiển thị yêu cầu xác nhận. 

   4.  Nhà tuyển dụng xác nhận. 

   5.  Hệ thống cập nhật trạng thái tin thành "Đã đóng". 

   6.  Kết thúc chức năng. 

- c) Nhà tuyển dụng hủy thao tác 

   1.  Nhà tuyển dụng nhấn "Hủy bỏ". 

   2.  Hệ thống xóa dữ liệu tạm thời. 

   3.  Kết thúc chức năng. 

- 3.3.3.10. Đặc tả Use Case Tìm kiếm ứng viên 

## **Mô tả** 

Chức năng cho phép Nhà tuyển dụng tìm kiếm ứng viên theo kỹ năng, kinh nghiệm và điểm năng lực. Hệ thống cung cấp thông tin hồ sơ chi tiết để Nhà tuyển dụng lựa chọn ứng viên phù hợp. 

Actor sử dụng chức năng này là: Nhà tuyển dụng (Đối tác bên ngoài). 

## **Điều kiện trước** 

Nhà tuyển dụng đã đăng nhập. 

Hệ thống có dữ liệu hồ sơ ứng viên. 

## **Tình huống chính** 

1.  Nhà tuyển dụng chọn chức năng "Tìm kiếm ứng viên". 

2.  Hệ thống hiển thị danh sách ứng viên. 

3.  Nhà tuyển dụng nhập từ khóa hoặc kỹ năng cần tìm. 

33 

4.  Nhà tuyển dụng thiết lập tiêu chí lọc. 

5.  Hệ thống thực hiện tìm kiếm. 

6.  Hệ thống hiển thị danh sách ứng viên phù hợp. 

7.  Nhà tuyển dụng chọn một ứng viên. 

8.  Hệ thống hiển thị hồ sơ chi tiết. 

9.  Kết thúc chức năng. 

**Các tình huống thay thế** 

- a) Không tìm thấy ứng viên phù hợp 

   1.  Hệ thống không có ứng viên thỏa mãn điều kiện. 

   2.  Hệ thống hiển thị thông báo không tìm thấy ứng viên. 

   3.  Kết thúc chức năng. 

- b) Lọc ưu tiên theo điểm năng lực 

   1.  Nhà tuyển dụng chọn chức năng lọc theo điểm năng lực. 

   2.  Hệ thống sắp xếp hoặc lọc ứng viên theo điểm đánh giá. 

   3.  Hệ thống hiển thị kết quả. 

- 3.3.3.11. Đặc tả Use Case Quản lý hồ sơ ứng tuyển 

## **Mô tả** 

Chức năng cho phép Nhà tuyển dụng xem và xử lý hồ sơ ứng tuyển của ứng viên. Nhà tuyển dụng có thể cập nhật trạng thái hồ sơ và gửi thông báo cho ứng viên. Actor sử dụng chức năng này là: Nhà tuyển dụng (Đối tác bên ngoài). 

## **Điều kiện trước** 

- Nhà tuyển dụng đã đăng nhập. 

- Nhà tuyển dụng có ít nhất một tin tuyển dụng. 

- Có hồ sơ ứng tuyển trong hệ thống. 

## **Tình huống chính** 

1.  Nhà tuyển dụng chọn "Quản lý hồ sơ ứng tuyển". 

2.  Hệ thống hiển thị danh sách hồ sơ. 

3.  Nhà tuyển dụng chọn một hồ sơ. 

4.  Hệ thống hiển thị chi tiết ứng viên. 

5.  Nhà tuyển dụng cập nhật trạng thái hồ sơ. 

34 

6.  Hệ thống lưu trạng thái mới. 

7.  Hệ thống thực hiện Use Case bao gộp: Gửi thông báo cho ứng viên. 

8.  Hệ thống hiển thị thông báo cập nhật thành công. 

9.  Kết thúc chức năng. 

## **Các tình huống thay thế** 

a) Cập nhật trạng thái thất bại 

   1.  Hệ thống phát hiện trạng thái không hợp lệ. 

   2.  Hệ thống hiển thị thông báo lỗi. 

   3.  Kết thúc chức năng. 

- b) Gửi thông báo thất bại 

   1.  Use Case "Gửi thông báo cho ứng viên" trả về lỗi. 

   2.  Hệ thống lưu trạng thái hồ sơ nhưng hiển thị cảnh báo gửi thông báo thất bại. 

   3.  Kết thúc chức năng. 

- 3.3.3.12. Đặc tả Use Case Thống kê tuyển dụng 

## **Mô tả** 

Chức năng cho phép Nhà tuyển dụng theo dõi hiệu quả các tin tuyển dụng thông qua số lượt xem và số lượng hồ sơ ứng tuyển, đồng thời hỗ trợ xuất danh sách ứng viên. Actor sử dụng chức năng này là: Nhà tuyển dụng (Đối tác bên ngoài). 

## **Điều kiện trước** 

- Nhà tuyển dụng đã đăng nhập. 

- Có dữ liệu tin tuyển dụng. 

## **Tình huống chính** 

1.  Nhà tuyển dụng chọn chức năng "Thống kê tuyển dụng". 

2.  Hệ thống tổng hợp dữ liệu. 

3.  Hệ thống hiển thị số lượt xem tin tuyển dụng. 

4.  Hệ thống hiển thị số lượng hồ sơ ứng tuyển. 

5.  Nhà tuyển dụng chọn chức năng "Xuất danh sách ứng viên". 

6.  Hệ thống thực hiện tạo file Excel / PDF. 

7.  Hệ thống cung cấp file cho Nhà tuyển dụng. 

8.  Kết thúc chức năng. 

35 

## **Các tình huống thay thế** 

- a) Không có dữ liệu thống kê 

   1.  Hệ thống phát hiện chưa có dữ liệu. 

   2.  Hệ thống hiển thị thông báo chưa có dữ liệu thống kê. 

   3.  Kết thúc chức năng. 

- b) Xuất báo cáo thất bại 

   1.  Hệ thống gặp lỗi trong quá trình tạo file. 

   2.  Hệ thống hiển thị thông báo xuất báo cáo thất bại. 

   3.  Kết thúc chức năng. 

- 3.3.3.13. Đặc tả Use Case Quản lý tài khoản và phân quyền 

## **Mô tả** 

Chức năng cho phép Quản trị viên quản lý tài khoản người dùng, khóa / mở khóa tài khoản, phân quyền và xác thực tài khoản doanh nghiệp. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

Quản trị viên đã đăng nhập thành công. 

Quản trị viên có quyền quản trị hệ thống. 

## **Tình huống chính** 

1.  Quản trị viên chọn chức năng "Quản lý tài khoản". 

2.  Hệ thống hiển thị danh sách tài khoản. 

3.  Quản trị viên chọn tài khoản cần xử lý. 

4.  Quản trị viên thực hiện khóa / mở khóa tài khoản. 

5.  Quản trị viên thực hiện phân quyền. 

6.  Quản trị viên có thể xác thực tài khoản doanh nghiệp. 

7.  Hệ thống kiểm tra quyền thao tác. 

8.  Hệ thống lưu thay đổi. 

9.  Hệ thống hiển thị thông báo thành công. 

10. Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Quản trị viên không có quyền thao tác 

36 

   1.  Hệ thống phát hiện Quản trị viên không có quyền thực hiện thao tác. 

   2.  Hệ thống từ chối yêu cầu. 

   3.  Kết thúc chức năng. 

- b) Tài khoản không tồn tại 

   1.  Hệ thống không tìm thấy tài khoản được chọn. 

   2.  Hệ thống hiển thị thông báo tài khoản không tồn tại. 

   3.  Kết thúc chức năng. 

- 3.3.3.14. Đặc tả Use Case Quản lý danh mục kỹ năng 

## **Mô tả** 

Chức năng cho phép Quản trị viên quản lý danh mục kỹ năng của hệ thống nhằm phục vụ tìm kiếm, lọc ứng viên và tạo tin tuyển dụng. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Quản trị viên đã đăng nhập. 

- Quản trị viên có quyền quản lý danh mục. 

## **Tình huống chính** 

1.  Quản trị viên chọn "Quản lý danh mục kỹ năng". 

2.  Hệ thống hiển thị danh sách kỹ năng. 

3.  Quản trị viên chọn tạo, sửa hoặc xóa kỹ năng. 

4.  Quản trị viên nhập thông tin kỹ năng. 

5.  Hệ thống kiểm tra dữ liệu. 

6.  Hệ thống lưu thay đổi. 

7.  Hệ thống cập nhật danh mục kỹ năng. 

8.  Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Tạo kỹ năng bị trùng 

   1.  Hệ thống phát hiện tên kỹ năng đã tồn tại. 

   2.  Hệ thống hiển thị thông báo kỹ năng đã tồn tại. 

   3.  Kết thúc chức năng. 

- b) Xóa kỹ năng đang được sử dụng 

37 

   1.  Quản trị viên chọn xóa một kỹ năng. 

   2.  Hệ thống phát hiện kỹ năng đang được sử dụng trong tin tuyển dụng hoặc hồ sơ. 

   3.  Hệ thống từ chối thao tác xóa. 

   4.  Kết thúc chức năng. 

- 3.3.3.15. Đặc tả Use Case Quản lý tuyển dụng nội bộ 

## **Mô tả** 

Chức năng cho phép Quản trị viên tạo tin đăng dự án nội bộ, thiết lập yêu cầu kỹ năng và ngân sách, đồng thời duyệt tin tuyển dụng và hồ sơ ứng viên. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

Quản trị viên đã đăng nhập. 

Danh mục kỹ năng đã được cấu hình. 

## **Tình huống chính** 

1.  Quản trị viên chọn "Quản lý tuyển dụng nội bộ". 

2.  Hệ thống hiển thị danh sách dự án. 

3.  Quản trị viên chọn "Tạo tin đăng dự án". 

4.  Quản trị viên nhập thông tin dự án. 

5.  Quản trị viên thiết lập yêu cầu kỹ năng và ngân sách. 

6.  Quản trị viên lưu tin. 

7.  Hệ thống kiểm tra dữ liệu. 

8.  Hệ thống lưu tin dự án. 

9.  Quản trị viên thực hiện duyệt tin. 

10. Quản trị viên xem và duyệt hồ sơ ứng viên. 

11. Hệ thống cập nhật kết quả. 

12. Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Tin dự án không hợp lệ 

   1.  Hệ thống phát hiện thiếu kỹ năng hoặc ngân sách không hợp lệ. 

   2.  Hệ thống hiển thị thông báo lỗi. 

38 

   3.  Kết thúc chức năng. 

- b) Hồ sơ ứng viên không được duyệt 

   1.  Quản trị viên chọn "Từ chối". 

   2.  Hệ thống cập nhật trạng thái hồ sơ. 

   3.  Hệ thống thông báo kết quả cho ứng viên. 

- 3.3.3.16. Đặc tả Use Case Quản lý Workspace dự án 

## **Mô tả** 

Chức năng cho phép Quản trị viên khởi tạo Workspace cho dự án và thêm các ứng viên trúng tuyển vào môi trường làm việc chung. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Dự án đã được tạo. 

- Có ít nhất một ứng viên được tuyển chọn. 

- Quản trị viên đã đăng nhập. 

## **Tình huống chính** 

1.  Quản trị viên chọn dự án cần tạo Workspace. 

2.  Hệ thống hiển thị thông tin dự án. 

3.  Quản trị viên chọn "Khởi tạo Workspace". 

4.  Hệ thống tạo Workspace. 

5.  Quản trị viên chọn ứng viên trúng tuyển. 

6.  Quản trị viên thêm ứng viên vào Workspace. 

7.  Hệ thống cập nhật danh sách thành viên. 

8.  Hệ thống hiển thị thông báo tạo Workspace thành công. 

9.  Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Workspace đã tồn tại 

   1.  Hệ thống phát hiện dự án đã có Workspace. 

   2.  Hệ thống hiển thị Workspace hiện tại. 

   3.  Kết thúc thao tác khởi tạo. 

- b) Ứng viên không hợp lệ 

39 

   1.  Quản trị viên chọn ứng viên chưa được tuyển. 

   2.  Hệ thống từ chối thêm ứng viên. 

   3.  Hệ thống hiển thị thông báo ứng viên không hợp lệ. 

- 3.3.3.17. Đặc tả Use Case Quản lý Task và tiến độ 

## **Mô tả** 

Chức năng cho phép Quản trị viên tạo Task, phân công Task cho ứng viên, đặt Deadline và theo dõi trạng thái cũng như tiến độ dự án. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Workspace đã được khởi tạo. 

- Có thành viên trong Workspace. 

- Quản trị viên đã đăng nhập. 

## **Tình huống chính** 

1.  Quản trị viên mở Workspace. 

2.  Quản trị viên chọn chức năng "Quản lý Task". 

3.  Quản trị viên tạo Task mới. 

4.  Quản trị viên nhập tên, mô tả và mức độ ưu tiên. 

5.  Quản trị viên phân công Task cho ứng viên. 

6.  Quản trị viên thiết lập Deadline. 

7.  Hệ thống lưu Task. 

8.  Hệ thống cập nhật trạng thái Task. 

9.  Quản trị viên theo dõi phần trăm hoàn thành. 

10. Hệ thống tổng hợp tiến độ dự án. 

11. Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Phân công Task thất bại 

   1.  Hệ thống phát hiện ứng viên không thuộc Workspace. 

   2.  Hệ thống hiển thị thông báo không thể phân công. 

   3.  Kết thúc chức năng. 

- b) Deadline không hợp lệ 

40 

   1.  Hệ thống phát hiện Deadline nhỏ hơn thời gian hiện tại hoặc không hợp lệ. 

   2.  Hệ thống hiển thị thông báo lỗi thời gian. 

   3.  Kết thúc chức năng. 

- c) Quản trị viên hủy tạo Task 

   1.  Quản trị viên chọn "Hủy bỏ". 

   2.  Hệ thống xóa dữ liệu tạm thời. 

   3.  Kết thúc chức năng. 

- 3.3.3.18. Đặc tả Use Case Đánh giá năng lực ứng viên 

## **Mô tả** 

Chức năng cho phép Quản trị viên nghiệm thu công việc và đánh giá năng lực ứng viên sau khi hoàn thành dự án. Kết quả đánh giá bao gồm điểm và nhận xét hiệu suất. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Dự án hoặc công việc đã hoàn thành. 

- Quản trị viên đã đăng nhập. 

- Có dữ liệu kết quả công việc để nghiệm thu. 

## **Tình huống chính: Đánh giá thành công** 

1.  Quản trị viên mở công việc cần đánh giá. 

2.  Hệ thống hiển thị kết quả công việc. 

3.  Quản trị viên thực hiện nghiệm thu. 

4.  Quản trị viên nhập điểm đánh giá. 

5.  Quản trị viên nhập nhận xét hiệu suất. 

6.  Quản trị viên nhấn "Lưu". 

7.  Hệ thống kiểm tra dữ liệu. 

8.  Hệ thống lưu kết quả đánh giá. 

9.  Hệ thống cập nhật điểm năng lực ứng viên. 

10. Hệ thống hiển thị thông báo đánh giá thành công. 

11. Kết thúc chức năng. 

## **Các tình huống thay thế** 

- a) Công việc không đạt yêu cầu nghiệm thu 

41 

   1.  Quản trị viên phát hiện công việc chưa đạt yêu cầu. 

   2.  Quản trị viên yêu cầu ứng viên bổ sung hoặc chỉnh sửa. 

   3.  Hệ thống giữ trạng thái công việc chưa hoàn thành. 

   4.  Kết thúc chức năng. 

- b) Điểm đánh giá không hợp lệ 

   1.  Hệ thống phát hiện điểm nằm ngoài phạm vi cho phép. 

   2.  Hệ thống hiển thị thông báo lỗi. 

   3.  Kết thúc chức năng. 

- 3.3.3.19. Đặc tả Use Case Thanh toán thù lao 

## **Mô tả** 

Chức năng cho phép Quản trị viên thực hiện thanh toán thù lao cho ứng viên sau khi công việc được nghiệm thu và theo dõi trạng thái thanh toán. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Công việc đã được nghiệm thu. 

- Khoản thù lao đã được xác định. 

- Thông tin thanh toán của ứng viên đã tồn tại. 

## **Tình huống chính: Thanh toán thành công** 

1.  Quản trị viên chọn chức năng "Thanh toán thù lao". 

2.  Hệ thống hiển thị danh sách khoản cần thanh toán. 

3.  Quản trị viên chọn khoản thanh toán. 

4.  Hệ thống hiển thị số tiền và thông tin người nhận. 

5.  Quản trị viên kiểm tra thông tin. 

6.  Quản trị viên xác nhận thanh toán. 

7.  Hệ thống thực hiện giao dịch thanh toán. 

8.  Hệ thống cập nhật trạng thái thanh toán. 

9.  Hệ thống hiển thị thông báo thanh toán thành công. 

10. Kết thúc chức năng. 

## **Các tình huống thay thế** 

a) Thanh toán thất bại do thiếu thông tin người nhận 

1.  Hệ thống phát hiện thông tin tài khoản nhận tiền chưa đầy đủ. 

42 

   2.  Hệ thống hiển thị thông báo yêu cầu bổ sung thông tin. 

   3.  Kết thúc chức năng. 

- b) Thanh toán thất bại do lỗi hệ thống 

   1.  Hệ thống phát hiện giao dịch không thực hiện được. 

   2.  Hệ thống ghi nhận trạng thái thanh toán thất bại. 

   3.  Hệ thống hiển thị thông báo lỗi thanh toán. 

   4.  Kết thúc chức năng. 

- c) Quản trị viên hủy thanh toán 

   1.  Quản trị viên chọn "Hủy bỏ". 

   2.  Hệ thống không thực hiện giao dịch. 

   3.  Kết thúc chức năng. 

- 3.3.3.20. Đặc tả Use Case Thống kê và báo cáo 

## **Mô tả** 

Chức năng cho phép Quản trị viên thống kê tình hình hoạt động của hệ thống, bao gồm hồ sơ ứng viên, tiến độ dự án, doanh nghiệp đối tác và chi phí trả lương. Hệ thống hỗ trợ kết xuất báo cáo dưới dạng Excel / PDF. 

Actor sử dụng chức năng này là: Quản trị viên (Chủ web / Quản trị dự án). 

## **Điều kiện trước** 

- Quản trị viên đã đăng nhập. 

   - Quản trị viên có quyền xem báo cáo. 

- Hệ thống có dữ liệu thống kê. 

## **Tình huống chính: Kết xuất báo cáo thành công** 

1.  Quản trị viên chọn chức năng "Thống kê và báo cáo". 

2.  Hệ thống hiển thị giao diện thống kê. 

3.  Quản trị viên chọn loại báo cáo. 

4.  Hệ thống tổng hợp dữ liệu hồ sơ ứng viên. 

5.  Hệ thống tổng hợp dữ liệu tiến độ dự án. 

6.  Hệ thống tổng hợp dữ liệu doanh nghiệp đối tác. 

7.  Hệ thống tổng hợp chi phí trả lương. 

8.  Hệ thống hiển thị kết quả thống kê. 

43 

9.  Quản trị viên chọn "Kết xuất báo cáo". 

10. Hệ thống tạo file Excel / PDF. 

11. Hệ thống cung cấp file báo cáo. 

12. Kết thúc chức năng. 

**Các tình huống thay thế** 

- a) Không có dữ liệu thống kê 

   1.  Hệ thống phát hiện không có dữ liệu tương ứng với điều kiện thống kê. 

   2.  Hệ thống hiển thị thông báo không có dữ liệu. 

   3.  Kết thúc chức năng. 

- b) Kết xuất báo cáo thất bại 

   1.  Hệ thống gặp lỗi khi tạo file Excel / PDF. 

   2.  Hệ thống hiển thị thông báo kết xuất báo cáo thất bại. 

   3.  Kết thúc chức năng. 

- c) Quản trị viên hủy kết xuất 

   1.  Quản trị viên nhấn "Hủy bỏ". 

   2.  Hệ thống hủy thao tác kết xuất. 

   3.  Kết thúc chức năng. 

44 

## **CHƯƠNG 4: THIẾT KẾ DỮ LIỆU** 

## **4.1 Sơ đồ Logic** 



<!-- Start of picture text -->
Uwe| vién Ke<br>Kinet NGHIEM. ouven THONGTHONG5  TIN TIN LICHGnasiy TRANGTuvéN THAI<br>5 HO SOONG ‘Tw Tuvén DUNG<br>vaITRO Nat<br>val TRO Tuyen KYNANG<br>by An N61 86<br>valTRO<br>WORKSPACE<br>‘ANH GIA NANG<br>we<br>tawnoin [| ||H WORKSPACETHANK VIEN<br>DOANE NGHIEP<br>TASK<br>HO so. UNG TwTuvéwone<br>BAINGP TASK<br><!-- End of picture text -->

## **4.2 Chi tiết các bảng dữ liệu** 

## **4.2.1 Bảng Vai trò (Roles)** 

Bảng roles dùng để lưu trữ các vai trò của người dùng trong hệ thống, làm cơ sở xác định phạm vi chức năng mà từng nhóm người dùng được phép sử dụng. Các vai trò chính gồm Quản trị viên, Ứng viên và Nhà tuyển dụng. 

_Lược đồ quan hệ:_ 

ROLES(id, name, description, created_at, updated_at) 

|**STT**<br>1|**Thuộc tính**<br>id|**Kiểu**<br>UUID|**Miền giá trị**<br>Không rỗng, duy|**Ý nghĩa**<br>Mã định danh|**Ghi chú**<br>PK|
|---|---|---|---|---|---|



45 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
||||nhất|vai trò||
|2|name|VARCHAR(50)|Không rỗng, duy<br>nhất|Tên/mã vai trò|UNIQUE|
|3|description|VARCHAR(255)|Có thể rỗng|Mô tả vai trò||
|4|created_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm tạo|DEFAULT<br>CURRENT_TI<br>MESTAMP|
|5|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật<br>gần nhất||



## **4.2.2 Bảng Quyền (permissions)** 

Bảng permissions dùng để lưu trữ danh sách các quyền thao tác cụ thể trong hệ thống. Các quyền này được kết hợp với vai trò để thực hiện cơ chế phân quyền truy cập RBAC. _Lược đồ quan hệ:_ 

PERMISSIONS(id, name, description, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,<br>duy nhất|Mã quyền|PK|
|2|name|VARCHAR(100)|Không rỗng,<br>duy nhất|Mã quyền thao tác|UNIQUE|
|3|description|VARCHAR(255)|Có thể rỗng|Mô tả quyền||
|4|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo||
|5|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật gần<br>nhất||



46 

## **4.2.3 Bảng Vai Trò - Quyền (role_permissions)** 

Bảng role_permissions là bảng trung gian dùng để thiết lập mối quan hệ giữa vai trò và quyền. Bảng cho phép một vai trò được gán nhiều quyền và một quyền có thể được sử dụng bởi nhiều vai trò khác nhau. 

_Lược đồ quan hệ:_ 

ROLE_PERMISSIONS(role_id, permission_id) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|role_id|UUID|Tồn tại trong roles|Vai trò được cấp<br>quyền|PK, FK → roles.id|
|2|permission_id|UUID|Tồn tại trong|Quyền của vai trò|PK,<br>FK<br>→|
||||permissions||permissions.id|



## **4.2.4 Bảng Tài khoản (Users)** 

Bảng users dùng để lưu trữ thông tin tài khoản và thông tin xác thực chung của người dùng trong hệ thống, bao gồm email, mật khẩu đã được băm, họ tên, trạng thái tài khoản và trạng thái xác thực email. 

_Lược đồ quan hệ:_ 

USERS(id, email, password_hash, full_name, status, email_verified, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,|Mã tài khoản|PK|
||||duy nhất|||
|2|email|VARCHAR(255)|Email hợp lệ,|Email đăng|UNIQUE, NOT|



47 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
||||không trùng|nhập|NULL|
|3|password_hash|VARCHAR(255)|Không rỗng|Mật khẩu sau<br>khi băm|Không lưu mật<br>khẩu gốc|
|4|full_name|VARCHAR(150)|Không rỗng|Họ tên người<br>dùng||
|5|status|VARCHAR(20)|ACTIVE,<br>LOCKED,<br>INACTIVE|Trạng thái tài<br>khoản||
|6|email_verified|BOOLEAN|TRUE/FALSE|Trạng thái xác<br>thực email|DEFAULT<br>FALSE|
|7|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo||
|8|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật<br>gần nhất||



## **4.2.5 Bảng Tài khoản - Vai Trò (user_roles)** 

Bảng user_roles là bảng trung gian dùng để gán vai trò cho các tài khoản người dùng. Thiết kế này hỗ trợ một tài khoản có thể được gán một hoặc nhiều vai trò khi hệ thống cần mở rộng trong tương lai. 

_Lược đồ quan hệ:_ 

USER_ROLES(user_id, role_id) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|user_id|UUID|Tồn tại trong users|Tài khoản được<br>gán vai trò|PK, FK → users.id|
|2|role_id|UUID|Tồn tại trong roles|Vai trò của tài<br>khoản|PK, FK → roles.id|



48 

## **4.2.6 Bảng hồ sơ ứng viên (candidate_profiles)** 

Bảng candidate_profiles dùng để lưu trữ hồ sơ năng lực chuyên môn của Người tìm việc/Freelancer, bao gồm thông tin giới thiệu, liên hệ, GitHub, Portfolio và điểm năng lực thực chiến được hệ thống tổng hợp. 

_Lược đồ quan hệ:_ 

CANDIDATE_PROFILES(id, user_id, professional_title, introduction, phone, 

address, github_url, portfolio_url, competency_score, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,<br>duy nhất|Mã hồ sơ|PK|
|2|user_id|UUID|Tồn tại trong<br>users, không<br>trùng|Tài khoản sở<br>hữu hồ sơ|FK,<br>UNIQUE|
|3|professional_title|VARCHAR(150)|Có thể rỗng|Chuyên môn/vị<br>trí chính||
|4|introduction|TEXT|Có thể rỗng|Giới thiệu bản<br>thân||
|5|phone|VARCHAR(20)|Số điện thoại<br>hợp lệ|Số liên hệ||
|6|address|VARCHAR(255)|Có thể rỗng|Địa chỉ/khu vực||
|7|github_url|VARCHAR(500)|URL hợp lệ|Liên kết GitHub||
|8|portfolio_url|VARCHAR(500)|URL hợp lệ|Liên<br>kết<br>Portfolio||
|9|competency_score|NUMERIC(4,2)|0.00–10.00|Điểm năng lực<br>tổng hợp|Hệ thống<br>cập nhật,<br>read-only|
|10|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo hồ<br>sơ||
|11|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật gần||



49 

nhất 

## **4.2.7 Bảng Kinh nghiệm (experiences)** 

Bảng experiences dùng để lưu trữ lịch sử kinh nghiệm làm việc của ứng viên. Mỗi hồ sơ ứng viên có thể khai báo nhiều kinh nghiệm tại các doanh nghiệp, tổ chức hoặc dự án khác nhau. 

_Lược đồ quan hệ:_ 

EXPERIENCES(id, candidate_profile_id, job_title, company_name, start_date, end_date, description) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,<br>duy nhất|Mã kinh nghiệm|PK|
|2|candidate_profile_id|UUID|Tồn tại trong<br>candidate_pro<br>files|Hồ sơ sở hữu kinh<br>nghiệm|FK|
|3|job_title|VARCHAR(150)|Không rỗng|Chức danh công<br>việc||
|4|company_name|VARCHAR(200)|Không rỗng|Tên đơn vị làm<br>việc||
|5|start_date|DATE|Ngày hợp lệ|Ngày bắt đầu||
|6|end_date|DATE|NULL hoặc ≥<br>start_date|Ngày kết thúc|NULL<br>nếu hiện<br>đang làm|
|7|description|TEXT|Có thể rỗng|Mô tả kinh<br>nghiệm||



50 

## **4.2.8 Bảng kỹ năng (Skills)** 

Bảng skills dùng để quản lý danh mục kỹ năng công nghệ dùng chung trong toàn hệ thống. Danh mục này được sử dụng để mô tả năng lực ứng viên, xác định yêu cầu của tin tuyển dụng và hỗ trợ chức năng tìm kiếm, lọc dữ liệu. 

_Lược đồ quan hệ:_ 

SKILLS(id, name, description, status, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy nhất|Mã kỹ năng|PK|
|2|name|VARCHAR(100)|Không rỗng, duy nhất|Tên kỹ năng IT|UNIQUE|
|3|description|VARCHAR(255)|Có thể rỗng|Mô tả kỹ năng||
|4|status|VARCHAR(20)|ACTIVE, INACTIVE|Trạng thái danh<br>mục||
|5|created_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm tạo||
|6|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật gần<br>nhất||



## **4.2.9 Bảng Ứng viên - Kỹ năng (candidate_skills)** 

Bảng candidate_skills là bảng trung gian dùng để xác định các kỹ năng mà từng ứng viên sở hữu. Ngoài liên kết giữa hồ sơ ứng viên và kỹ năng, bảng còn lưu mức độ thành thạo và số năm kinh nghiệm tương ứng với từng kỹ năng. 

_Lược đồ quan hệ:_ 

CANDIDATE_SKILLS(candidate_profile_id, skill_id, level, years_of_experience) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|candidate_profile_id|UUID|Tồn tại trong|Hồ sơ ứng viên|PK, FK|



51 

||||candidate_profiles|||
|---|---|---|---|---|---|
|2|skill_id|UUID|Tồn tại trong skills|Kỹ năng|PK, FK|
|3|level|VARCHAR(20)|BEGINNER,<br>INTERMEDIATE<br>, ADVANCED,<br>EXPERT|Mức độ thành<br>thạo||
|4|years_of_experience|NUMERIC(4,1)|0<br>≥|Số năm kinh<br>nghiệm||



## **4.2.10 Bảng thông tin nhận tiền (payment_information)** 

Bảng payment_information dùng để lưu trữ thông tin tài khoản nhận tiền của Freelancer, phục vụ quá trình thanh toán thù lao sau khi công việc hoặc dự án nội bộ được nghiệm thu. 

_Lược đồ quan hệ:_ 

PAYMENT_INFORMATION(id, candidate_profile_id, account_holder_name, bank_name, account_number, status, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,<br>duy nhất|Mã thông tin<br>nhận tiền|PK|
|2|candidate_profile_id|UUID|Tồn tại, không<br>trùng|Hồ sơ ứng viên<br>sở hữu|FK,<br>UNIQUE|
|3|account_holder_nam<br>e|VARCHAR(150)|Không rỗng|Tên chủ tài<br>khoản||
|4|bank_name|VARCHAR(150)|Không rỗng|Tên ngân hàng||
|5|account_number|VARCHAR(50)|Không rỗng|Số tài khoản<br>nhận tiền|Dữ liệu<br>nhạy cảm|
|6|status|VARCHAR(20)|ACTIVE,<br>INACTIVE|Trạng thái sử<br>dụng||



52 

|7|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo|
|---|---|---|---|---|
|8|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật<br>gần nhất|



## **4.2.11 Bảng Doanh nghiệp (companies)** 

Bảng companies dùng để lưu trữ thông tin của các doanh nghiệp đối tác tham gia tuyển dụng trên nền tảng, bao gồm tên doanh nghiệp, mã số thuế, địa chỉ, thông tin liên hệ và trạng thái xác thực. 

_Lược đồ quan hệ:_ 

COMPANIES(id, user_id, name, tax_code, address, email, website, 

verification_status, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,<br>duy nhất|Mã doanh nghiệp|PK|
|2|user_id|UUID|Tồn tại trong<br>users, không<br>trùng|Tài khoản quản lý<br>doanh nghiệp|FK,<br>UNIQUE|
|3|name|VARCHAR(200)|Không rỗng|Tên doanh nghiệp||
|4|tax_code|VARCHAR(20)|Không rỗng,<br>duy nhất|Mã số thuế|UNIQUE|
|5|address|VARCHAR(255)|Không rỗng|Địa chỉ doanh<br>nghiệp||
|6|email|VARCHAR(255)|Email hợp lệ|Email<br>doanh<br>nghiệp||
|7|website|VARCHAR(500)|URL hợp lệ<br>hoặc NULL|Website công ty||
|8|verification_status|VARCHAR(20)|PENDING,|Trạng thái xác||



53 

||||VERIFIED,<br>REJECTED|thực|
|---|---|---|---|---|
|9|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo|
|10|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật gần<br>nhất|



## **4.2.12 Bảng Tin tuyển dụng (job_posts)** 

Bảng job_posts dùng để lưu trữ các tin tuyển dụng trên hệ thống, bao gồm cả tin tuyển nhân sự cho dự án nội bộ của Chủ website và tin tuyển dụng của doanh nghiệp đối tác. Bảng chứa các thông tin về vị trí tuyển dụng, hình thức làm việc, mức thù lao, thời hạn và trạng thái của tin. 

_Lược đồ quan hệ:_ 

JOB_POSTS(id, created_by_user_id, company_id, title, description, post_type, work_type, location, salary_min, salary_max, quantity, posted_at, deadline, status, view_count, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi**|**chú**|
|---|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy<br>nhất|Mã tin tuyển<br>dụng|PK||
|2|created_by_user_id|UUID|Tồn tại trong users|Người tạo tin|FK||
|3|company_id|UUID|NULL hoặc tồn|Doanh nghiệp|FK,|NULL|
||||tại<br>trong|đăng tin|với|tin nội|
||||companies||bộ||
|4|title|VARCHAR(255)|Không rỗng|Tiêu đề tuyển|||
|||||dụng|||
|5|description|TEXT|Không rỗng|Nội dung mô tả|||
|6|post_type|VARCHAR(20)|INTERNAL,|Loại tin|||



54 

||||PARTNER|||
|---|---|---|---|---|---|
|7|work_type|VARCHAR(20)|FREELANCE,<br>PART_TIME,<br>REMOTE|Hình thức làm<br>việc||
|8|location|VARCHAR(255)|Có thể rỗng|Địa điểm|Có<br>thể<br>NULL với<br>Remote|
|9|salary_min|NUMERIC(15,2)|NULL hoặc ≥ 0|Mức thù lao tối<br>thiểu||
|10|salary_max|NUMERIC(15,2)|NULL hoặc ≥<br>salary_min|Mức thù lao tối<br>đa||
|11|quantity|INTEGER|> 0|Số lượng cần<br>tuyển||
|12|posted_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời<br>điểm<br>đăng||
|13|deadline|TIMESTAMPTZ|> posted_at|Hạn nhận hồ sơ||
|14|status|VARCHAR(30)|DRAFT,<br>PENDING_APP<br>ROVAL, OPEN,<br>HIDDEN,<br>CLOSED|Trạng thái tin||
|15|view_count|INTEGER|0<br>≥|Số lượt xem|DEFAULT<br>0|
|16|created_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm tạo||
|17|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật<br>gần nhất||



55 

## **4.2.13 Bảng Tin tuyển dụng - Kỹ năng (job_post_skills)** 

Bảng job_post_skills là bảng trung gian dùng để xác định các kỹ năng cần thiết đối với từng tin tuyển dụng. Một tin tuyển dụng có thể yêu cầu nhiều kỹ năng và một kỹ năng có thể xuất hiện trong nhiều tin tuyển dụng khác nhau. 

_Lược đồ quan hệ:_ 

JOB_POST_SKILLS(job_post_id, skill_id) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền**|**giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|---|
|1|job_post_id|UUID|Tồn|tại trong|Tin tuyển dụng|PK, FK|
||||job_p|osts|||
|2|skill_id|UUID|Tồn<br>skills|tại trong|Kỹ năng yêu<br>cầu|PK, FK|



## **4.2.14 Bảng Hồ sơ ứng tuyển (applications)** 

Bảng applications dùng để lưu trữ các hồ sơ ứng tuyển mà ứng viên gửi vào từng tin tuyển dụng. Bảng đồng thời lưu Cover Letter, CV đính kèm, thời điểm ứng tuyển và trạng thái xử lý hiện tại của hồ sơ. 

_Lược đồ quan hệ:_ 

APPLICATIONS(id, candidate_profile_id, job_post_id, cover_letter, cv_url, status, applied_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy|Mã hồ sơ ứng|PK|
||||nhất|tuyển||
|2|candidate_profile_id|UUID|Tồn tại trong|Ứng viên gửi|FK|
||||candidate_profiles|hồ sơ||
|3|job_post_id|UUID|Tồn tại trong<br>job_posts|Tin được ứng<br>tuyển|FK|



56 

|4|cover_letter|TEXT|Có thể rỗng|Thư ngỏ||
|---|---|---|---|---|---|
|5|cv_url|VARCHAR(500)|URL hợp lệ hoặc<br>NULL|CV đính kèm<br>bổ sung||
|6|status|VARCHAR(20)|PENDING,<br>VIEWED,<br>INTERVIEW,<br>HIRED,<br>REJECTED|Trạng<br>thái<br>hiện tại|DEFAU<br>LT<br>PENDI<br>NG|
|7|applied_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm ứng<br>tuyển||
|8|updated_at|TIMESTAMPTZ|applied_at<br>≥|Lần cập nhật<br>gần nhất||



## **4.2.15 Bảng Lịch sử trạng thái ứng tuyển (application_status_history)** 

Bảng application_status_history dùng để lưu lại lịch sử thay đổi trạng thái của từng hồ sơ ứng tuyển. Dữ liệu này giúp theo dõi toàn bộ quá trình xử lý hồ sơ từ lúc ứng tuyển cho đến khi trúng tuyển hoặc bị từ chối. 

_Lược đồ quan hệ:_ 

APPLICATION_STATUS_HISTORY(id, application_id, status, changed_at, note) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi**|
|---|---|---|---|---|---|
||||||**chú**|
|1|id|UUID|Không rỗng, duy<br>nhất|Mã lịch sử|PK|
|2|application_id|UUID|Tồn tại trong|Hồ sơ được thay|FK|
||||applications|đổi||



57 

|3|status|VARCHAR(20)|Các trạng thái hợp<br>lệ của hồ sơ|Trạng thái tại thời<br>điểm ghi nhận|
|---|---|---|---|---|
|4|changed_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm thay đổi|
|5|note|TEXT|Có thể rỗng|Ghi chú xử lý|



## **4.2.16 Bảng dự án nội bộ (internal_projects)** 

Bảng internal_projects dùng để lưu trữ thông tin các dự án do Chủ website tổ chức và tuyển Freelancer tham gia thực hiện. Bảng quản lý các thông tin như ngân sách, thời gian thực hiện, trạng thái và tỷ lệ hoàn thành của dự án. 

Lược đồ quan hệ: 

INTERNAL_PROJECTS(id, job_post_id, name, description, budget, start_date, expected_end_date, actual_end_date, status, completion_rate, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy<br>nhất|Mã lịch sử|PK|
|2|application_id|UUID|Tồn tại trong<br>applications|Hồ sơ được thay đổi|FK|
|3|status|VARCHAR(20)|Các trạng thái hợp<br>lệ của hồ sơ|Trạng thái tại thời<br>điểm ghi nhận||
|4|changed_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm thay đổi||
|5|note|TEXT|Có thể rỗng|Ghi chú xử lý||



58 

## **4.2.17 Bảng Workspace (workspaces)** 

Bảng workspaces dùng để lưu trữ không gian làm việc được khởi tạo cho từng dự án nội bộ. Workspace là môi trường tập trung để quản lý thành viên, phân công Task, theo dõi tiến độ và hỗ trợ quá trình thực hiện dự án. 

_Lược đồ quan hệ:_ 

WORKSPACES(id, internal_project_id, name, status, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không<br>rỗng,<br>duy nhất|Mã Workspace|PK|
|2|internal_project_id|UUID|Tồn tại, không<br>trùng|Dự án sở hữu<br>Workspace|FK,<br>UNIQUE|
|3|name|VARCHAR(255)|Không rỗng|Tên Workspace||
|4|status|VARCHAR(20)|ACTIVE,|Trạng<br>thái||
||||CLOSED,<br>ARCHIVED|Workspace||
|5|created_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm khởi<br>tạo||
|6|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật||



## **4.2.18 Bảng Thành viên Workspace (workspace_members)** 

Bảng workspace_members dùng để quản lý danh sách các ứng viên đã trúng tuyển và được thêm vào từng Workspace. Bảng đóng vai trò liên kết giữa hồ sơ ứng viên và Workspace, đồng thời xác định trạng thái tham gia của từng thành viên trong dự án. 

Lược đồ quan hệ: 

59 

WORKSPACE_MEMBERS(id, workspace_id, candidate_profile_id, joined_at, status) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi**<br>**chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy<br>nhất|Mã thành viên<br>Workspace|PK|
|2|workspace_id|UUID|Tồn tại trong<br>workspaces|Workspace tham<br>gia|FK|
|3|candidate_profile_id|UUID|Tồn tại trong<br>candidate_profiles|Ứng viên tham<br>gia|FK|
|4|joined_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm tham<br>gia||
|5|status|VARCHAR(20)|ACTIVE,<br>COMPLETED,<br>REMOVED|Trạng thái thành<br>viên||



## **4.2.19 Bảng Task (tasks)** 

Bảng tasks dùng để lưu trữ và quản lý các công việc được tạo trong Workspace. Mỗi Task chứa thông tin mô tả, mức độ ưu tiên, thời hạn, trạng thái, phần trăm hoàn thành và thành viên được phân công thực hiện. 

_Lược đồ quan hệ:_ 

TASKS(id, workspace_id, assignee_member_id, title, description, priority, deadline, status, completion_percentage, created_at, updated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,|Mã Task|PK|
||||duy nhất|||
|2|workspace_id|UUID|Tồn tại trong|Workspace chứa|FK|



60 

||||workspaces|Task||
|---|---|---|---|---|---|
|3|assignee_member_id|UUID|NULL hoặc<br>tồn tại trong<br>workspace_me<br>mbers|Thành viên được<br>giao Task|FK, có<br>thể<br>NULL<br>trước<br>khi giao|
|4|title|VARCHAR(255)|Không rỗng|Tên Task||
|5|description|TEXT|Có thể rỗng|Nội dung công việc||
|6|priority|VARCHAR(20)|LOW,<br>MEDIUM,<br>HIGH|Mức độ ưu tiên||
|7|deadline|TIMESTAMPTZ|Thời<br>điểm<br>tương lai khi<br>tạo|Hạn hoàn thành||
|8|status|VARCHAR(20)|TODO,<br>DOING,<br>DONE|Trạng thái Kanban||
|9|completion_percenta<br>ge|SMALLINT|0–100|Phần trăm hoàn<br>thành||
|10|created_at|TIMESTAMPTZ|Thời gian hợp<br>lệ|Thời điểm tạo Task||
|11|updated_at|TIMESTAMPTZ|created_at<br>≥|Lần cập nhật||



## **4.2.20 Bảng Bài nộp Task (task_submissions)** 

Bảng task_submissions dùng để lưu trữ các sản phẩm hoặc kết quả công việc mà ứng viên nộp cho từng Task. Bảng hỗ trợ nhiều phiên bản bài nộp và ghi nhận trạng thái nghiệm thu để phục vụ quá trình yêu cầu chỉnh sửa hoặc chấp nhận sản phẩm. _Lược đồ quan hệ:_ 

TASK_SUBMISSIONS(id, task_id, submitted_at, product_url, attachment_url, note, version, review_status) 

61 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi**<br>**chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng, duy<br>nhất|Mã bài nộp|PK|
|2|task_id|UUID|Tồn tại trong tasks|Task được nộp kết<br>quả|FK|
|3|submitted_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm nộp||
|4|product_url|VARCHAR(500)|URL hoặc NULL|Link<br>sản<br>phẩm/repository||
|5|attachment_url|VARCHAR(500)|URL hoặc NULL|File đính kèm||
|6|note|TEXT|Có thể rỗng|Ghi chú của ứng viên||
|7|version|INTEGER|1<br>≥|Phiên bản bài nộp||
|8|review_status|VARCHAR(30)|PENDING_REVI<br>EW, ACCEPTED,<br>REVISION_REQ<br>UIRED|Kết quả nghiệm thu||



## **4.2.21 Bảng Đánh giá năng lực (candidate_evaluations)** 

Bảng candidate_evaluations dùng để lưu trữ kết quả đánh giá năng lực của ứng viên sau quá trình tham gia và hoàn thành dự án nội bộ. Kết quả đánh giá gồm điểm số và nhận xét, đồng thời là dữ liệu xác thực được sử dụng để tổng hợp điểm năng lực trên hồ sơ ứng viên. 

_Lược đồ quan hệ:_ 

CANDIDATE_EVALUATIONS(id, workspace_member_id, score, comment, evaluated_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|



62 

|1|id|UUID|Không rỗng, duy nhất|Mã đánh<br>giá|PK|
|---|---|---|---|---|---|
|2|workspace_member_<br>id|UUID|Tồn<br>tại<br>trong<br>workspace_members<br>, không trùng|Thành<br>viên<br>được<br>đánh giá|FK,<br>UNIQUE|
|3|score|NUMERIC(4,2)|0.00–10.00|Điểm<br>năng lực|CHECK|
|4|comment|TEXT|Có thể rỗng|Nhận xét<br>hiệu suất||
|5|evaluated_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời<br>điểm<br>đánh giá||



## **4.2.22 Bảng Thanh toán (payments)** 

Bảng payments dùng để lưu trữ và theo dõi các khoản thanh toán thù lao cho Freelancer sau khi công việc được nghiệm thu. Bảng quản lý số tiền, phương thức thanh toán, mã giao dịch, trạng thái giao dịch và thời điểm thanh toán. 

_Lược đồ quan hệ:_ 

PAYMENTS(id, workspace_member_id, amount, payment_method, 

transaction_code, status, created_at, paid_at) 

|**STT**|**Thuộc tính**|**Kiểu**|**Miền giá trị**|**Ý nghĩa**|**Ghi chú**|
|---|---|---|---|---|---|
|1|id|UUID|Không rỗng,|Mã khoản|PK|
||||duy nhất|thanh toán||
|2|workspace_member_id|UUID|Tồn tại trong<br>workspace_me|Thành viên<br>nhận thù lao|FK|



63 

||||mbers|||
|---|---|---|---|---|---|
|3|amount|NUMERIC(15,2)|> 0|Số tiền thanh<br>toán||
|4|payment_method|VARCHAR(30)|Ví dụ VNPAY,<br>BANK_TRAN<br>SFER|Phương thức<br>chi trả||
|5|transaction_code|VARCHAR(100)|Có thể NULL<br>trước khi giao<br>dịch|Mã giao dịch<br>từ<br>cổng<br>thanh toán|Nên<br>UNIQUE<br>khi có giá<br>trị|
|6|status|VARCHAR(20)|PENDING,<br>PROCESSING,<br>PAID, FAILED|Trạng thái<br>thanh toán||
|7|created_at|TIMESTAMPTZ|Thời gian hợp lệ|Thời điểm<br>tạo khoản chi||
|8|paid_at|TIMESTAMPTZ|NULL hoặc ≥<br>created_at|Thời điểm<br>thanh toán<br>thành công|NULL<br>nếu chưa<br>thanh<br>toán|



## **4.3 Sơ đồ quan hệ** 

**<u>https://dbdiagram.io/d/6aa90502fe722b4a39f29e27</u>** 

64 

## **CHƯƠNG 5: THIẾT KẾ GIAO DIỆN** 

## **5.1. Dùng figma để thiết kế giao diện tham khảo** 

Trong quá trình xây dựng hệ thống, Figma được sử dụng để thiết kế giao diện tham khảo trước khi tiến hành triển khai giao diện thực tế. Việc thiết kế trên Figma giúp nhóm có thể hình dung tổng thể bố cục của website, cách sắp xếp các thành phần trên từng trang cũng như trải nghiệm tương tác của người dùng. 

Thông qua Figma, nhóm tiến hành thiết kế các thành phần cơ bản của hệ thống như thanh điều hướng, nút chức năng, biểu mẫu nhập liệu, danh sách dữ liệu, khu vực hiển thị nội dung và các thành phần giao diện khác. 

Việc xây dựng giao diện mẫu trước giúp nhóm dễ dàng đánh giá và điều chỉnh bố cục, màu sắc, kích thước cũng như vị trí của các thành phần trước khi triển khai thành giao diện thực tế. 

65 

## **5.1.1. Đăng nhập** 



<!-- Start of picture text -->
<>] DevHub<br>EMAIL CUA BAN<br>MAT KHAU stk<br><!-- End of picture text -->



<!-- Start of picture text -->
12 248 36 1,520<br>Ta ttn og gba by Wess inateringin aty<br>SE on<br>"ng guar toy geo thing i ‘<br><!-- End of picture text -->

66 

## **5.1.2. Trang chủ Freelancer** 



<!-- Start of picture text -->
meas ' Xin chao, Minh Tuan!<br>© tes iis hig Ss GS bap My ac nag cg ot eo a eb hae<br>% wero soavaanne &) |) mre BD —Wrwamgersartt §—-« vin dangtnamgis »<br>B He song wwyén 85% 12 3 2<br>2<br>© demos amen toe Vige tam 6 xust remuted28) Dydn ngibg +<br>T erestsnaelieneedineel a tng E-esening Core coment<br>hence nate heals Teter ‘Module Thanh Yosn Stipe lntgraton sipbians<br>eens ovmaerate<br>. x 06 hoan thign ho so<br>@ ‘i<br>_ WWUX Designer (Mobile & Web) © Tram eninge ONTT (e158)<br>Trang thai ing tuyén gan day<br>wei/cOno<br>Frontend Developerr¥ NokvunoTureN-" — — rRaNoTHAL<br><!-- End of picture text -->

## **5.1.3. Tìm kiếm việc làm** 



<!-- Start of picture text -->
Tim céng viéc IT pht hgp véi ban<br>190<br>BG 24 cing vige phi hop<br>Senior React Developer<br>Kintoa<br>save mong 25-s0.uifu/tndog amie<br>Backend Engineer<br>— Node,js os<br>ceensnawe Note Ponsa as<br>1500-2.200080 7 renee}<br>2 ee<br>Python Data Engineer<br>opin primes Aetow gtury<br>0-004 ning (emis }<br><!-- End of picture text -->

67 

## **5.1.4. Chi tiết việc làm** 



<!-- Start of picture text -->
a Téng quan céng vige<br>Senior React Developer<br>35-50 mi thing<br>KY nang yéu cau ent<br>M6 ta cong viée<br>Yéu cau dy 4n<br>Han<br>ang tuyén<br><!-- End of picture text -->

68 

## **5.1.5. Ứng tuyển** 



<!-- Start of picture text -->
| Ho sor Freelancera8 chon revolithecs) |) (RMCRMSTERIIRID (onion cubic: H<br>H ‘Trin Hoang Nam iat Senter Reset ative Bode Jo Developer :<br>H ‘Senioe Futstack Engineer + 6 ndm kinh nghigen ey, See careers Coe: H<br>EKpning1H ResctischuytnNodajs min TypeSerpt ANS Goud Docker RESTIULAPL ff££££ @@$ $1800~$2,800/cutn3,estar:noayliprp.nochmangae ;H:<br>1:H Tene: $f + TainSndemkinnnghidm ming React Native vi RESTAPI<br>}_Kinh 5 ££ +08 ung itn anaicong dung ttn App Store va Pay Store}<br>}{it _ghidmgitthc86 phin Tuy8nchién phat windyng,cicTo gidiIb Hong php WebNam, cOmotquy Fullstackmd in. EngineerNhdn théywét youhon cbu cia6 nem kin dydn Hey|; * KN nang hy quin ly in a) walam we doc Hip to HH<br>{tbl twong thich vol bb ky ning React, Node.js cing nhu kinh nghigen t6l wy hoa AWS cia ti, Hon H<br>Emo rt mong musn duoc dng hinh cling quj céng ty xy dung vb ning cép ne tndnghigntal = FE ;<br>i eden tl uu ans. pd H<br>££ @ xem trude oo o1en nro THAY ;<br>H it SenoeRaatack engineer H<br>i EE<br>H : ££ remattntegoonamirnngttmve: Webnetie, nein hin1 yd Hj<br>if 18 &9 an cng POF DOCX Deng zg 1 6s ME) H<br>$B Vullong atin day di thong tin bit bude H<br>} © inn dang Cv kndng hop. Vel long ti ln fe POF node DOCK H<br>£ © Cong wite my 68 d6ng tuyén j<br>$ © Banas dng tuyén vi tr by roi H<br><!-- End of picture text -->

69 

## **5.1.6. Hồ sơ năng lực** 

70 



<!-- Start of picture text -->
| Thong tin ca nhan 98 Chinn sira<br>Emait an.nguyen@email.com<br>S0.in thog! 0901 234 867<br>Dia chi Quén 7, TP. HO Chi Minh<br>Ngay sinh 18/03/1992<br>68 tinh Nam<br>Hinh thirc lam viee Remote / Hybrid<br>| Ky nangIr 38 Chinnsire<br>| Kinh nghigmlam vige %8 Chinnsire<br>* Senior Developer<br>+ Full-Stack Developer<br>* — Junior Developer<br><!-- End of picture text -->

71 



<!-- Start of picture text -->
| Lién két tai khoan & Hoat dong 98 Chinn sia<br>& Taikhodn GitHub @® Ho so nang ly (Portfotio)<br>245 18 12<br>Pong 9¢0.nkm noots —Pubse repo Ov in tuna bay<br>tigen nga hang at: TypeSerst, JavaScript, Python CH mngt i cubs 08/00/2026<br>© Diém danh gia thy chién @ HE THONGDANN Gud<br>Chat trgng code —— 85/10<br>TONG HOP THYC CHIEN<br>Giao tip — 9/10<br>| | 2270 deactine a 8/10 8.5 |<br>Gidi quyét vin 8 —— 85/10 —<br>© Lich sir dy an ndi bd @ WE rHONG DANN OA<br>TEN DY AN TRANG THAI THOLIAN ea oy AN<br>Hé thdng quin ty kho — ABC Corp Hodnthinn 03/2026 -08/2026 e910<br>App dit lich khdm Banh — HealthCareVN Hoan tinh 10/2025 -02/2026 285/10<br>Dashboard analytics— DataVN Bang thyerite 07/2026 - Hen tal =<br>Website landing page — StartupXYZ Hodnthinh 06/2025 - 09/2025 8/10<br><!-- End of picture text -->

72 

## **5.1.7. Theo dõi hồ sơ ứng tuyển** 



<!-- Start of picture text -->
Ho so ting tuyén EEE cert+ ote6 asin4 mngiyin3 en8<br>Chua cé hd so ung tuyén nado<br><!-- End of picture text -->

73 

## **5.1.8. Workspace Kanban** 



<!-- Start of picture text -->
© erect rtctorm Bang Kanban quan ly céng vigc See see<br>‘Dyae én Website Thuong cont B- oat 3 8 Mosmtnion 2 a-<br>een cme com co<br>——— Thiet ki glao itn trang chd Xy dyng API dang ahdp Kigm th module thant tose<br>‘ 8 E s o<br>@ ox ven ey = magn<br>Pree Toa Nu ut ates Tien hop eg ha tosn Depay staging server<br>‘ e 6 s<br>OD TamueyTrio nan énnn Vietne wing ‘at — Fcneushhttresponsiveooncnnevg<br>© curating — -<br>‘ é : *<br>« 2etomptma von<br><!-- End of picture text -->

74 

## **5.1.9. Chi tiết Task** 



<!-- Start of picture text -->
(Q) Thiét ké giao dién trang chu enon sia ®<br>M6 ta cong viée THONG<br>TIN CHI TIET<br>Thiét ké UYUX cho trang chi cia sin thuong mai dign tir Fintrex. Yéu c3u eae<br>phong céch hign dai, t6i gidn, tp trung vao trai nghiém mua s4m mugt ma. cect benhe<br>~ CBn thiét kB dy di cdc trang thai (Responsive cho Desktop & Mobile) * C20 2<br>~ Ding bé vei hé théng Design System hién tai. Trang thai<br>Sdn phSm ban giao i © Dang tim od<br>Link sin phim Nguid thye hig<br>@ nitps://figma.com/file/fintrex-homepage-concept-v2 e Nguyén Minn Tudn<br>' ~~ ' Han choe Ngay t90<br>‘ tt ' © 151172026 © ovo9/2028<br>Kéo tha file hoge nhéin dé tai Ken '<br>Cee Eee || ee henna 65%<br>& Dinh dang fe kntng nop i SL)<br>& Fie vue qué kich thude cho phép (10MB © 0wh pte tw 0.080 100<br>omepage-mockup-v2.fig °<br>0 Gesign-specs. pat s<br><!-- End of picture text -->

75 

## **5.1.10. Employer Dashboard** 



<!-- Start of picture text -->
B Tog qn ]<br>o x " au ¢ 4<br>12 248 36 1,520<br>rave oes a ny : ee<br>ting any ing itn dng a -<br><!-- End of picture text -->

76 

## **5.1.11. Tìm kiếm ứng viên** 



<!-- Start of picture text -->
Q eset, Node<br>Tim thy 3 dmg vibe pi hop v6 tke Sipx6p theo: O¥mndWye cao n hstg¥ inh nghifmnhibu nist<br>BO loc tim kiém Xa b Nguyén Vin An © Sinsingnninvitc  &04%<br>A lebaae di og © Gnamiinn nghiom — @ HOChiMinn<br>© Futstack develope<br>Mooie Deveope Tran Thi Binh W stastngntavne) “kone F xemto |<br>Kp nang cbng nghd © Snimiinh nghidm — @ HONG<br>wan - React Vuejs Typescript CSSGrid_Webpack<br>wale Typesere ‘aucune =<br>6 nim kin nghigen © Andmtinn nghiém —@ 08 Ning<br>© 3-Snim<br>Piém ning We v0<br>—<br><!-- End of picture text -->

77 

## **5.1.12. Admin Dashboard** 



<!-- Start of picture text -->
} Teng $6 agus ang a ing wen R ow tuyén dung o Ta tuyén yng e |<br>: 12,540 9,820 2,720 384 H<br>i asters a siess 2 ass 24% H<br>E oy snnging fs] Dyn dang host dong ” He so cho duyét ° Knodn thanh toinchoity<br>: 48 32 18 184.2Ma i<br>fm saax a 120% 2-150% 248% H<br>5 © Tien a6 dy dn ndi bo Xem tite © Téng quan thanh toan '<br>i Core 1T Portal - Nang ep V2 ———— Doanh thu thing ny ;<br>5 sauihimciaa 85% nod entry ing tin 2 H<br>; oo 1.42Bd H<br>2 He théng anh a — H<br>4 ba Nauytn Ti “aaa 42% hodn thin See i<br>H GIAO DICH GANDAY H<br>| ee perorerreny Stop hointninn panel eared asoma |<br>= sos _ Tome ag |<br>, anon nd oxen Brende wtn oh H<br>i Mon Hodng FPT Telecom 2eome }<br>5i © Phé duyétdang cho xirly 18ybucau i<br>H Av Hogt dong gan diy H<br>jtH ‘Dingeeky Doanh atanonce nghi¢ptoesmol7grute- FPT Software chi nhénh mign T... waa Noort Hobng Mish 8 np don ing tin dyin covert i|<br>Portal H<br>ja) Eo unnoe snot Wena i<br>i si |. HRFPT Software a3 dng tin tuyén dung méi SeniorReact |<br>|H yess CPYeu chuAngbOI CVHe &thingChingduyttchity dng- Nguyen» HomVanquaSon (Ky sur BbO MB) ns, wd panied HH<br>H Tran Vin Knént dB hobn thinh bs test kj ning Ooleng =<br>i Aavenced H<br>H Wi insng 8 yang pn aay song itn Pram An |<br>Tus H<br>H Doanh nghiép VNG di thanh tos thinh céng dich wy Ding — |<br>i tin Vip :<br><!-- End of picture text -->

78 

## **5.1.13. Quản lý người dùng** 



<!-- Start of picture text -->
Oy Xa nnn khéa tai khoan<br>Ban c6 chdc chan mudn khéa tai khodn cla ngubt ding Lé TH)<br>Hong Nope? Noutt ding nay sé khong thé dang nhgp vio he<br>tndng hose si ang bat ky aicn vy no cho dén ki dug més<br>khdatré tai,<br>©Hanh ota nay of ait mbt emat thing béo ty ding ol thich<br>|W do khéa tit kholbn cho ngutt dung.=<br><!-- End of picture text -->

## **5.1.14. Quản lý tuyển dụng nội bộ** 



<!-- Start of picture text -->
Q Tense ay sn Nene ¥ thes + Bue<br>Dydnngibd Bite<br>Bin Ago<br>Tendyin ning you Nat ten Séiveng——Ungtyin Tang Tmotte<br>yng any sna v2 —_— esnacnecog 3 sr Omnia Aventoso Bin Ore<br>dng ep ting Coed a i 320000000 ¢ 2 | Aieniiis) Gt. eim<br>Coorg mettontith ‘ase Prato mesT A 200.000.0006 ‘ 12050 chaauntt Axnrmw Bs erm<br>Tennentg gene 0 toe trate 000000009 2 cme Can eum<br>Partin big ia sat teh tone 380.000.0004 2 teeing Aieniw eis oxen<br>Chateran oy ye tgs orton 2000000006 : eco Aunioie) Cie ene<br>i thy 1-8 ct 12.4 4n ‘@:><br><!-- End of picture text -->

79 

## **5.1.15. Workspace Admin** 



<!-- Start of picture text -->
ca) Prin<br>exe ns<br>64% 24 8 2<br>cantin bangin Haintnion 6<br>$y ston Tu<br>\ Cron °<br>Vie AP quinn Kien ten nop<br>° ° oO<br>Toots ning din Dasnboard nog ks<br>° °<br><!-- End of picture text -->

## **5.1.16. Nghiệm thu & đánh giá** 



<!-- Start of picture text -->
"hn tinby bn 3 cnet cong vite ting vn env nibn<br>Xdby dung He tng E-Commerce Prat trién Modute Thanh ton MomoyStripe: & ‘Tran Anh Quin:<br>4 Kétqua<br>Bin giao én phi<br>Nonidet Sin prim £2 nh la Ning ive ang vién<br>© slim 8.5 9.0<br>5 Yee sng cis nen<br>‘sprint . tone sano<br><!-- End of picture text -->

80 

## **5.1.17. Thanh toán thù lao** 



<!-- Start of picture text -->
Thanhtodn thit lao 4s me 0eiee Chi tiét thanh toan e<br>Cho thanh toan ° D5 thanh tog fo} Thanh ton that bal @ NguyénSee Van An<br>50.500.000 d 1.240.000.000 4 6.200.000 4 E-Commerce Mobile App<br>Q Y Loe trang ens<br>freetancer Dyin sstien Tengtn than tase 18.500.000 g<br>é Negrin Ven Aa E-CommerceMobile App 18,600.000g —_Techcombank+ 1903.82 Teknonba tianTecheombenk<br>1903 5542 88102<br>& Tran Thi Minh UYUX Redesign Web ——12,000.000g —Vietcombort+ 021.912 NOUYENVAN AN<br>6 Pham Meh Oke API Integration Dey —24,000.000g MB Bark+ 0981.956<br>& Lé Hoang Nam SEO Optimization Suite 6.200.000 TPBark * 0441..0%<br>Pomme Copywriting &Brandng 85000009 BOY+ 2151128<br>& VOTWn Oot React Dasnboord Bild 32,000.000g ACH + Ba1..44s<br>6 Sree Bewneiog<br>Tir engi thanhtos<br><!-- End of picture text -->

81 

## **5.1.18. Thống kê & báo cáo** 



<!-- Start of picture text -->
B oveva0z—wnonee © thehavin Qi<br>or en ee ec ee ee rid s<br>1,247 3,856 89 342 24 2.4 ty VND<br>Théng ké dng vién & hd so © Onan 9:0 peta Doan nghigp 461 tde {© cing nah asx<br>2 Tichion 2<br>ave 168<br>eee 8 inot t oe we 10sx<br>“Thong ké tuyén dung 0 tray @ Oran@ Pingvin @ Trine<br>Tién 46 dy dn nGi b> @raininin W Ongiin @ cmavirane<br>Website THOT‘App Mobile Banking xll || I I |<br>1 tnéog came el hh Hl ly<br>Portalnnn sy el ee uae me<br>Apt ateway Oe<br>Chi phi tra long freelancer (trigu VNO) Screening — reagontenny syne<br>the the tho tho he ho<br>‘ Bs ° ? ° °<br><!-- End of picture text -->

## **5.2. Thiết kế giao diện hệ thống:** 

Sau khi hoàn thành giao diện tham khảo trên Figma, nhóm tiến hành đánh giá và lựa chọn những thành phần phù hợp để triển khai trên hệ thống thực tế. 

Trong quá trình triển khai, giao diện không được sao chép hoàn toàn từ bản thiết kế Figma mà được điều chỉnh dựa trên mục tiêu của đề tài, đặc điểm người sử dụng và yêu cầu về hiệu năng của hệ thống. 

## **5.2.1. Nhận xét giao diện được tạo từ Figma** 

Giao diện được thiết kế trên Figma có những ưu điểm nhất định, tuy nhiên vẫn tồn tại một số hạn chế cần được cải thiện khi triển khai thực tế. 

Ưu điểm: 

82 

- ●Đầy đủ chức năng: Giao diện trên Figma thể hiện tương đối đầy đủ các chức năng dự kiến của hệ thống. 

- ●Sử dụng nhiều component: Các thành phần giao diện được xây dựng dưới dạng component giúp tăng tính thống nhất và thuận tiện khi thay đổi thiết kế. 

- ●Bố cục rõ ràng: Các khu vực chức năng được phân chia tương đối rõ ràng, giúp hình dung được cấu trúc của hệ thống. 

Hạn chế: 

- ●Hiển thị quá nhiều thông tin: Một số màn hình chứa nhiều nội dung và thành phần cùng lúc, có thể gây nhiễu và làm người dùng khó tập trung vào chức năng chính. 

- ●Bố cục còn nhiều thành phần: Việc sử dụng quá nhiều component trên cùng một màn hình có thể làm giao diện trở nên phức tạp. 

- ●Chưa tối ưu trải nghiệm người dùng: Một số nội dung không thực sự cần thiết đối với thao tác hiện tại của người dùng nhưng vẫn được hiển thị. 

- ●Chưa chú trọng đầy đủ đến hiệu năng: Giao diện có nhiều thành phần có thể làm tăng lượng tài nguyên cần tải, đặc biệt khi hệ thống có nhiều người sử dụng cùng lúc. 

Từ những nhận xét trên, nhóm tiến hành đơn giản hóa giao diện khi xây dựng hệ thống thực tế, ưu tiên các chức năng quan trọng và loại bỏ những nội dung không cần thiết. 

## **5.2.2. Mục tiêu thiết kế giao diện** 

Dựa trên những hạn chế của giao diện được thiết kế trên Figma và mục tiêu của đề tài, nhóm đề ra các mục tiêu cho giao diện thực tế như sau: 

- ●Khắc phục những điểm hạn chế của giao diện Figma: Giảm các thành phần không cần thiết, hạn chế việc hiển thị quá nhiều thông tin trên cùng một màn hình. 

- ●Phù hợp với mục tiêu của đề tài: Giao diện phải đáp ứng được các chức năng và đối tượng người dùng mà hệ thống hướng đến. 

83 

- ●Hỗ trợ nhiều người dùng cùng lúc: Giao diện được thiết kế theo hướng nhẹ, hạn chế các thành phần không cần thiết nhằm giảm tài nguyên sử dụng và thời gian tải trang. 

- ●Dễ nhìn: Sử dụng bố cục, kích thước chữ và khoảng cách hợp lý để người dùng có thể dễ dàng quan sát và tìm kiếm thông tin. 

- ●Dễ sử dụng: Các chức năng được bố trí ở những vị trí dễ nhận biết, giúp người dùng thực hiện thao tác một cách thuận tiện. 

- ●Layout đơn giản: Hạn chế việc chia quá nhiều khu vực trên một màn hình, tập trung vào nội dung và chức năng chính. 

- ●Nội dung vừa đủ: Chỉ hiển thị những thông tin cần thiết cho từng chức năng, tránh đưa quá nhiều dữ liệu lên cùng một giao diện. 

- ●Tính nhất quán: Các thành phần như nút bấm, biểu mẫu, thanh điều hướng và cách hiển thị dữ liệu được thiết kế thống nhất giữa các trang. 

- ●Khả năng tương thích: Giao diện được xây dựng nhằm đảm bảo khả năng hiển thị phù hợp trên các kích thước màn hình khác nhau. 

Như vậy, giao diện thực tế được định hướng theo nguyên tắc đơn giản, trực quan, dễ sử dụng và tối ưu, thay vì cố gắng đưa toàn bộ thông tin và chức năng lên cùng một màn hình. 

## **5.2.3. Giao diện thực tế của Website** 

Sau quá trình đánh giá giao diện trên Figma, nhóm tiến hành triển khai giao diện thực tế của website. Giao diện được xây dựng dựa trên các yêu cầu chức năng của hệ thống và các mục tiêu đã đề ra. 

So với bản thiết kế trên Figma, giao diện thực tế được tinh giản các thành phần không cần thiết, giảm lượng thông tin hiển thị đồng thời và tập trung vào các chức năng chính của từng trang. 

Các giao diện chính của website bao gồm: 

84 

## **CHƯƠNG 6:KẾ HOẠCH TRIỂN KHAI VÀ PHƯƠNG ÁN KIỂM THỬ** 

## **6.1 Kế hoạch triển khai:** 

Quá trình triển khai hệ thống được thực hiện theo từng giai đoạn nhằm bảo đảm các chức năng được xây dựng có trình tự, dễ kiểm soát và thuận lợi cho việc kiểm thử. Với đặc điểm hệ thống gồm nhiều phân hệ như quản lý tài khoản, tuyển dụng, hồ sơ ứng viên, quản lý dự án nội bộ, Workspace, Task, đánh giá năng lực và thanh toán, việc phát triển được chia thành các bước từ hoàn thiện thiết kế đến tích hợp và kiểm thử toàn hệ thống. 

Hệ thống được xây dựng theo mô hình Client–Server, trong đó Frontend sử dụng React, Backend sử dụng Node.js kết hợp Express.js, cơ sở dữ liệu sử dụng PostgreSQL và các thành phần trao đổi dữ liệu thông qua RESTful API. Git được sử dụng để quản lý phiên bản mã nguồn, ClickUp hỗ trợ theo dõi tiến độ công việc và Figma được sử dụng trong quá trình thiết kế giao diện. 

## **6.1.1. Các giai đoạn triển khai** 

|**Giai đoạn**|**Nội dung thực hiện**|**Kết quả dự kiến**|
|---|---|---|
|**1. Hoàn thiện phân tích**<br>**và thiết kế**|Rà soát yêu cầu chức năng, Use Case,<br>thiết kế dữ liệu, sơ đồ logic, thiết kế<br>giao diện và các luồng nghiệp vụ|Bộ tài liệu thiết kế<br>hoàn chỉnh làm cơ sở<br>phát triển|
|**2. Khởi tạo hệ thống và**<br>**cơ sở dữ liệu**|Tạo cấu trúc dự án Frontend,<br>Backend; thiết lập PostgreSQL; xây<br>dựng các bảng, khóa và ràng buộc dữ<br>liệu|Cấu trúc hệ thống và cơ<br>sở dữ liệu ban đầu|
|**3. Phát triển chức năng**<br>**tài khoản và phân**<br>**quyền**|Xây dựng đăng ký, đăng nhập, xác<br>thực tài khoản, quên mật khẩu, JWT<br>và RBAC|Hệ thống xác thực và<br>phân quyền hoạt động|
|**4. Phát triển hồ sơ ứng**<br>**viên**|Xây dựng Profile IT, kỹ năng, kinh<br>nghiệm, GitHub/Portfolio và dữ liệu<br>năng lực|Ứng viên có thể xây<br>dựng và quản lý hồ sơ|



85 

|**5. Phát triển phân hệ**<br>**tuyển dụng**|Xây dựng quản lý tin tuyển dụng, tìm<br>kiếm, lọc, ứng tuyển và quản lý trạng<br>thái hồ sơ|Hoàn thiện luồng tuyển<br>dụng cho ứng viên và<br>doanh nghiệp|
|---|---|---|
|**6. Phát triển phân hệ dự**<br>**án nội bộ**|Xây dựng dự án nội bộ, Workspace,<br>thành viên dự án, Task và bảng<br>Kanban|Hình thành không gian<br>quản lý công việc nội<br>bộ|
|**7. Phát triển nghiệm**<br>**thu và đánh giá**|Xây dựng bài nộp Task, cập nhật<br>trạng thái nghiệm thu, chấm điểm và<br>nhận xét ứng viên|Hệ thống lưu được dữ<br>liệu năng lực thực<br>chiến|
|**8. Phát triển thanh toán**<br>**và báo cáo**|Tích hợp quy trình thanh toán, lưu<br>trạng thái giao dịch, thống kê và xuất<br>báo cáo|Hoàn thiện các nghiệp<br>vụ quản trị cuối quy<br>trình|
|**9. Tích hợp và kiểm thử**|Kết nối Frontend – Backend –<br>Database, kiểm thử luồng nghiệp vụ<br>và xử lý lỗi|Phiên bản hệ thống ổn<br>định|
|**10. Hoàn thiện và triển**<br>**khai**|Tối ưu giao diện, hiệu năng, sửa lỗi,<br>chuẩn bị dữ liệu mẫu và triển khai hệ<br>thống|Sản phẩm hoàn chỉnh<br>phục vụ báo cáo và<br>trình diễn|



## **6.1.2. Triển khai cơ sở dữ liệu** 

Cơ sở dữ liệu PostgreSQL được xây dựng dựa trên mô hình dữ liệu đã thiết kế ở Chương 4. Quá trình triển khai cần bảo đảm các bảng có khóa chính, khóa ngoại và các ràng buộc phù hợp nhằm duy trì tính toàn vẹn dữ liệu. 

Các quan hệ nhiều-nhiều được xử lý thông qua các bảng trung gian như tài khoản – vai trò, vai trò – quyền, ứng viên – kỹ năng, tin tuyển dụng – kỹ năng và thành viên Workspace. 

Bên cạnh đó, một số ràng buộc nghiệp vụ cần được kiểm tra tại tầng Backend kết hợp với cơ sở dữ liệu, chẳng hạn: 

86 

- Một ứng viên không được ứng tuyển nhiều lần vào cùng một tin tuyển dụng. 

- Chỉ ứng viên đã thuộc Workspace mới được phân công Task của Workspace đó. 

- Nhà tuyển dụng đối tác không được truy cập Workspace của dự án nội bộ. 

- Điểm năng lực thực chiến chỉ được cập nhật từ kết quả đánh giá của hệ thống. 

- Khoản thanh toán chỉ được thực hiện sau khi công việc đáp ứng điều kiện nghiệm thu. 

- Tin tuyển dụng nội bộ và tin tuyển dụng của doanh nghiệp đối tác phải được phân biệt rõ trong quá trình xử lý. 

## **6.1.3. Triển khai Backend** 

Backend được xây dựng bằng Node.js và Express.js, tổ chức theo các module nghiệp vụ để giảm sự phụ thuộc giữa các thành phần và thuận lợi cho việc bảo trì. 

Các nhóm API chính dự kiến bao gồm: 

- API xác thực và quản lý tài khoản. 

- API quản lý vai trò và quyền. 

- API hồ sơ ứng viên, kỹ năng và kinh nghiệm. 

- API doanh nghiệp và tin tuyển dụng. 

- API ứng tuyển và trạng thái hồ sơ. 

- API dự án nội bộ và Workspace. 

- API quản lý Task và bài nộp. 

- API đánh giá năng lực. 

- API thanh toán. 

- API thống kê và báo cáo. 

Các yêu cầu gửi đến Backend được kiểm tra qua Middleware trước khi xử lý. Middleware được sử dụng cho các chức năng như xác thực JWT, kiểm tra quyền truy cập, kiểm tra dữ liệu đầu vào và xử lý lỗi. 

87 

## **6.1.4. Triển khai Frontend** 

Frontend được xây dựng bằng React và tổ chức theo các nhóm giao diện tương ứng với từng loại người dùng. 

Đối với Người tìm việc, giao diện tập trung vào quản lý hồ sơ năng lực, tìm kiếm việc làm, ứng tuyển, theo dõi hồ sơ, tham gia Workspace và cập nhật Task. 

Đối với Nhà tuyển dụng, giao diện tập trung vào quản lý thông tin doanh nghiệp, tin tuyển dụng, tìm kiếm ứng viên và xử lý hồ sơ ứng tuyển. 

Đối với Quản trị viên, giao diện cung cấp các chức năng quản lý người dùng, danh mục kỹ năng, tuyển dụng nội bộ, Workspace, Task, nghiệm thu, đánh giá, thanh toán và thống kê. 

Riêng Workspace được định hướng xây dựng theo dạng bảng Kanban để người dùng có thể theo dõi trạng thái công việc theo các nhóm như To Do, Doing và Done, phù hợp với yêu cầu đã xác định trong phần phân tích hệ thống. 

## **6.1.5. Quản lý mã nguồn và tiến độ** 

Git được sử dụng để quản lý phiên bản mã nguồn trong quá trình phát triển. Các chức năng nên được phát triển trên các nhánh riêng trước khi kiểm tra và hợp nhất vào nhánh chính nhằm hạn chế ảnh hưởng giữa các thành phần. 

ClickUp được sử dụng để quản lý danh sách công việc, người thực hiện, trạng thái và tiến độ của từng hạng mục. Các công việc có thể được chia theo các nhóm như phân tích, thiết kế, Backend, Frontend, Database, kiểm thử và tài liệu. 

Figma tiếp tục được sử dụng làm tài liệu tham chiếu cho giao diện nhằm bảo đảm sự thống nhất giữa thiết kế và sản phẩm triển khai thực tế. 

## **6.2. Phương án kiểm thử dự kiến** 

## **6.2.1. Mục tiêu kiểm thử** 

Quá trình kiểm thử được thực hiện nhằm các mục tiêu: 

88 

- Xác minh các chức năng hoạt động đúng theo yêu cầu nghiệp vụ. 

- Phát hiện lỗi trong quá trình xử lý dữ liệu và giao tiếp giữa các thành phần. 

- Kiểm tra tính chính xác của cơ chế xác thực và phân quyền. 

- Kiểm tra tính toàn vẹn của dữ liệu khi thực hiện các thao tác thêm, sửa, xóa và cập nhật trạng thái. 

- Đánh giá khả năng xử lý các trường hợp dữ liệu không hợp lệ. 

- Kiểm tra khả năng hoạt động của hệ thống trên các trình duyệt được hỗ trợ. 

- Kiểm tra các luồng nghiệp vụ liên kết nhiều phân hệ như tuyển dụng → Workspace → Task → đánh giá → thanh toán. 

## **6.2.2. Phạm vi kiểm thử** 

## 6.2.2.1. Trong phạm vi kiểm thử 

Trong phạm vi đề tài, hoạt động kiểm thử tập trung vào các chức năng và thành phần trực tiếp do nhóm xây dựng, bao gồm: 

Các chức năng quản lý tài khoản và phân quyền; quản lý hồ sơ năng lực ứng viên; quản lý kỹ năng; quản lý doanh nghiệp; tìm kiếm và quản lý tin tuyển dụng; ứng tuyển và xử lý hồ sơ; quản lý dự án nội bộ; Workspace; Task; bài nộp và nghiệm thu; đánh giá năng lực; thanh toán; thống kê và kết xuất báo cáo. 

Bên cạnh kiểm thử giao diện, các RESTful API và cơ chế trao đổi dữ liệu giữa Frontend, Backend và PostgreSQL cũng nằm trong phạm vi kiểm thử. 

Các chức năng phân quyền được kiểm tra theo ba nhóm người dùng là Quản trị viên, Người tìm việc và Nhà tuyển dụng. 

## 6.2.2.2. Ngoài phạm vi kiểm thử 

Kiểm thử tải và hiệu năng ở quy mô lớn như Stress Testing hoặc Load Testing với số lượng người dùng rất lớn không nằm trong phạm vi trọng tâm của đề tài. Hệ thống chỉ thực hiện đánh giá hiệu năng ở mức cơ bản đối với các thao tác thường xuyên sử dụng. 

89 

Kiểm thử xâm nhập bảo mật chuyên sâu (Penetration Testing) cũng không thuộc phạm vi đề tài. Nhóm tập trung kiểm tra các vấn đề bảo mật ở mức nghiệp vụ như xác thực, phân quyền, bảo vệ mật khẩu và ngăn chặn truy cập trái phép. 

Đối với các dịch vụ bên thứ ba như cổng thanh toán, nhóm chỉ kiểm tra quá trình tích hợp, dữ liệu gửi/nhận và xử lý phản hồi thông qua môi trường thử nghiệm hoặc dữ liệu mô phỏng; không kiểm thử bản thân hệ thống của nhà cung cấp. 

## **6.2.3. Hướng tiếp cận kiểm thử** 

## **a. Kiểm thử hộp đen** 

Kiểm thử hộp đen được áp dụng để đánh giá các chức năng của hệ thống từ góc độ người sử dụng mà không phụ thuộc vào cấu trúc mã nguồn bên trong. Các chức năng được kiểm tra dựa trên dữ liệu đầu vào, quy tắc nghiệp vụ và kết quả đầu ra mong đợi. 

## **b. Kiểm thử API và tích hợp** 

Các RESTful API được kiểm tra độc lập nhằm xác minh dữ liệu đầu vào, mã phản hồi, dữ liệu đầu ra, xác thực JWT và quyền truy cập. Đồng thời thực hiện kiểm thử tích hợp để bảo đảm dữ liệu được trao đổi chính xác giữa Frontend, Backend và cơ sở dữ liệu. 

## **c. Kiểm thử hệ thống** 

Kiểm thử hệ thống được thực hiện trên toàn bộ ứng dụng để xác định các luồng nghiệp vụ có hoạt động đúng từ đầu đến cuối hay không. 

Các luồng quan trọng gồm: 

- Đăng ký → đăng nhập → tạo Profile → tìm việc → ứng tuyển. 

- Nhà tuyển dụng đăng tin → nhận hồ sơ → cập nhật trạng thái ứng tuyển. 

- Admin tuyển Freelancer → tạo Workspace → phân Task → Freelancer nộp sản phẩm → nghiệm thu → đánh giá → thanh toán. 

## **d. Kiểm thử chấp nhận** 

90 

Ở giai đoạn cuối, hệ thống được đối chiếu với các yêu cầu chức năng và đặc tả Use Case đã xác định để đánh giá mức độ đáp ứng của sản phẩm. 

## **6.2.4. Các chức năng dự kiến kiểm thử** 

Các chức năng dự kiến cần kiểm thử bao gồm: 

|**STT**|**Nhóm chức năng**|**Nội dung cần kiểm thử**|
|---|---|---|
|1|Quản lý tài khoản và xác thực|Đăng ký tài khoản, đăng nhập, đăng xuất, quên<br>mật khẩu, xác thực email và kiểm tra trạng thái<br>tài khoản.|
|2|Quản lý vai trò và phân quyền|Gán vai trò cho tài khoản, quản lý quyền theo vai<br>trò và kiểm soát phạm vi chức năng của Quản trị<br>viên, Người tìm việc và Nhà tuyển dụng.|
|3|Quản lý hồ sơ năng lực ứng viên|Tạo và cập nhật hồ sơ cá nhân, thông tin chuyên<br>môn, GitHub/Portfolio, kinh nghiệm làm việc và<br>các thông tin liên quan đến hồ sơ năng lực.|
|4|Quản lý kỹ năng ứng viên|Thêm, cập nhật và quản lý các kỹ năng của ứng<br>viên, mức độ thành thạo và số năm kinh nghiệm<br>đối với từng kỹ năng.|
|5|Tra cứu việc làm và dự án|Tìm kiếm và lọc tin tuyển dụng theo từ khóa, kỹ<br>năng, mức lương, hình thức làm việc, địa điểm và<br>loại tin tuyển dụng.|
|6|Ứng tuyển công việc|Gửi hồ sơ ứng tuyển, sử dụng hồ sơ năng lực, đính<br>kèm Cover Letter/CV và ghi nhận hồ sơ ứng<br>tuyển trên hệ thống.|
|7|Theo dõi hồ sơ ứng tuyển|Xem danh sách hồ sơ đã nộp, trạng thái hiện tại<br>và lịch sử thay đổi trạng thái của từng hồ sơ ứng<br>tuyển.|
|8|Quản lý thông tin doanh nghiệp|Đăng ký tài khoản doanh nghiệp, cập nhật thông|



91 

|||tin doanh nghiệp và xử lý trạng thái xác thực<br>doanh nghiệp.|
|---|---|---|
|9|Quản lý tin tuyển dụng của<br>doanh nghiệp|Tạo, cập nhật, ẩn, đóng tin tuyển dụng; thiết lập<br>yêu cầu kỹ năng, mức lương, số lượng tuyển và<br>thời hạn nhận hồ sơ.|
|10|Tìm kiếm và tra cứu ứng viên|Tìm kiếm hồ sơ ứng viên theo kỹ năng, kinh<br>nghiệm và điểm năng lực; xem chi tiết hồ sơ ứng<br>viên.|
|11|Quản lý hồ sơ ứng tuyển của<br>Nhà tuyển dụng|Xem hồ sơ ứng viên, cập nhật trạng thái xử lý và<br>theo dõi quá trình tuyển dụng của từng tin tuyển<br>dụng.|
|12|Quản lý tài khoản người dùng<br>của Quản trị viên|Tra cứu tài khoản, khóa/mở khóa tài khoản, phân<br>quyền và xác thực tài khoản doanh nghiệp.|
|13|Quản lý danh mục kỹ năng|Thêm, sửa, quản lý trạng thái và kiểm soát việc<br>sử dụng các kỹ năng dùng chung trong hệ thống.|
|14|Quản lý tuyển dụng nội bộ|Tạo tin tuyển dự án nội bộ, thiết lập kỹ năng và<br>ngân sách, quản lý hồ sơ ứng tuyển và lựa chọn<br>ứng viên tham gia dự án.|
|15|Quản lý dự án nội bộ|Khởi tạo và quản lý thông tin dự án, trạng thái dự<br>án, thời gian thực hiện, ngân sách và tiến độ tổng<br>thể của dự án.|
|16|Quản lý Workspace|Khởi tạo Workspace cho dự án, thêm ứng viên<br>trúng tuyển vào Workspace và quản lý danh sách<br>thành viên tham gia dự án.|
|17|Quản lý Task và tiến độ công<br>việc|Tạo Task, phân công thành viên, thiết lập<br>Deadline, mức độ ưu tiên, cập nhật trạng thái và<br>phần trăm hoàn thành công việc.|
|18|Quản lý bài nộp và nghiệm thu|Nộp link/file sản phẩm, quản lý các lần nộp, xem<br>kết quả công việc, nghiệm thu và yêu cầu chỉnh<br>sửa khi sản phẩm chưa đạt yêu cầu.|



92 

|19|Đánh giá năng lực ứng viên|Ghi nhận điểm đánh giá và nhận xét sau quá trình<br>thực hiện dự án, cập nhật kết quả đánh giá vào hồ<br>sơ năng lực của ứng viên.|
|---|---|---|
|20|Quản lý thông tin nhận tiền|Cập nhật và quản lý thông tin cần thiết để ứng<br>viên nhận thù lao từ các dự án nội bộ.|
|21|Thanh toán thù lao|Khởi tạo giao dịch thanh toán, xử lý thông tin<br>thanh toán và theo dõi trạng thái chi trả thù lao<br>cho Freelancer.|
|22|Thống kê và báo cáo|Tổng hợp dữ liệu người dùng, tuyển dụng, dự án,<br>tiến độ và chi phí; hiển thị thống kê và kết xuất<br>dữ liệu Excel/PDF.|



## **6.2.5. Kiểm thử phân quyền và bảo mật** 

Do hệ thống có ba nhóm người dùng với phạm vi nghiệp vụ khác nhau, kiểm thử phân quyền là một nội dung quan trọng. 

Các trường hợp chính cần kiểm tra gồm: 

- Người chưa đăng nhập không được truy cập các chức năng yêu cầu xác thực. 

- Ứng viên không được truy cập chức năng quản trị. 

   - Nhà tuyển dụng không được truy cập Workspace của Chủ website. 

- Nhà tuyển dụng chỉ được quản lý các tin tuyển dụng thuộc doanh nghiệp của mình. 

- Nhà tuyển dụng chỉ được xử lý hồ sơ ứng tuyển liên quan đến tin của doanh nghiệp mình. 

   - Ứng viên chỉ được cập nhật Task được phân công cho mình. 

- Ứng viên không được sửa điểm đánh giá thực chiến. 

   - Chỉ Quản trị viên có quyền nghiệm thu, đánh giá và thực hiện thanh toán. 

- API phải kiểm tra quyền ở Backend, không chỉ ẩn chức năng trên giao diện. 

93 

Thông tin mật khẩu phải được lưu dưới dạng đã băm. Các API yêu cầu đăng nhập sử dụng JWT để xác thực và Middleware để kiểm tra quyền truy cập, phù hợp với yêu cầu bảo mật đã xác định trong đề cương. 

## **6.2.6. Kiểm thử dữ liệu** 

Kiểm thử dữ liệu tập trung vào tính toàn vẹn của cơ sở dữ liệu PostgreSQL. 

Một số ràng buộc cần kiểm tra: 

- Email tài khoản không được trùng. 

- Tên kỹ năng trong danh mục không được trùng. 

- Mỗi ứng viên chỉ có một hồ sơ năng lực. 

- Một ứng viên không được ứng tuyển hai lần vào cùng một tin. 

- Một ứng viên không được xuất hiện nhiều lần trong cùng Workspace. 

- Task chỉ được gán cho thành viên của Workspace tương ứng. 

- Điểm đánh giá phải nằm trong phạm vi quy định. 

- Phần trăm hoàn thành Task phải từ 0 đến 100. 

- Ngày kết thúc dự án không được nhỏ hơn ngày bắt đầu. 

- Hạn nộp hồ sơ phải hợp lệ so với thời điểm đăng tin. 

   - Số tiền thanh toán phải lớn hơn 0. 

- Dữ liệu liên quan phải duy trì tính nhất quán khi một giao dịch cập nhật nhiều bảng. 

## **6.2.7. Kiểm thử giao diện và khả năng tương thích** 

Giao diện hệ thống cần được kiểm tra trên các trình duyệt phổ biến theo phạm vi đã xác định gồm Chrome, Edge, Firefox và Safari. 

Nội dung kiểm thử bao gồm: 

- Hiển thị đúng bố cục. 

- Form nhập liệu không bị tràn hoặc mất nội dung. 

- Thông báo lỗi hiển thị rõ ràng. 

94 

- Các nút chức năng hoạt động đúng. 

- Bảng dữ liệu hiển thị và phân trang đúng. 

- Các bộ lọc tìm kiếm hoạt động chính xác. 

- Workspace và bảng Kanban thao tác ổn định. 

- Trạng thái Task được cập nhật đúng sau thao tác kéo – thả. 

- Giao diện vẫn sử dụng tốt trên các kích thước màn hình PC/Laptop phổ biến. 

## **6.2.8. Môi trường và công cụ kiểm thử** 

## **Môi trường kiểm thử** 

Hệ thống dự kiến được triển khai trên môi trường phát triển và môi trường kiểm thử tách biệt với môi trường vận hành chính thức. Cơ sở dữ liệu kiểm thử sử dụng PostgreSQL và được chuẩn bị các bộ dữ liệu đại diện cho ba nhóm người dùng gồm Quản trị viên, Người tìm việc và Nhà tuyển dụng. 

Môi trường kiểm thử cần có các tài khoản với quyền khác nhau để phục vụ kiểm tra chức năng phân quyền và các luồng nghiệp vụ liên quan. 

## **Công cụ hỗ trợ** 

|**Công cụ**|**Mục đích**|
|---|---|
|Postman|Kiểm thử RESTful API|
|Chrome / Edge / Firefox / Safari|Kiểm thử giao diện và tương thích|
|PostgreSQL|Kiểm tra dữ liệu và ràng buộc|
|ClickUp|Quản lý công việc và ghi nhận lỗi|
|Git|Quản lý phiên bản mã nguồn và theo dõi thay đổi|
|DevTools của trình duyệt|Kiểm tra request, response và lỗi Frontend|



95 

**6.2.9. Rủi ro trong quá trình kiểm thử** 

|**STT**|**Rủi ro**|**Mức tác động**|**Phương án xử lý**|
|---|---|---|---|
|1|Phạm vi chức năng lớn,<br>nhiều luồng nghiệp vụ liên<br>kết|Cao|Ưu tiên kiểm thử các luồng nghiệp<br>vụ cốt lõi trước|
|2|Mã nguồn và yêu cầu thay<br>đổi trong quá trình phát triển|Cao|Quản lý phiên bản bằng Git và cập<br>nhật lại các trường hợp kiểm thử<br>khi chức năng thay đổi|
|3|Cổng thanh toán hoặc dịch<br>vụ bên ngoài không sẵn sàng|Trung bình|Sử dụng Sandbox hoặc Mock<br>Response để kiểm thử luồng tích<br>hợp|
|4|Dữ liệu kiểm thử chưa đủ đa<br>dạng|Trung bình|Chuẩn bị dữ liệu cho đầy đủ các<br>nhóm quyền, trạng thái ứng tuyển,<br>Task, dự án và thanh toán|



## **6.2.10. Quản lý lỗi** 

Các lỗi phát hiện trong quá trình kiểm thử được ghi nhận trên ClickUp, bao gồm mô tả lỗi, mức độ ảnh hưởng, chức năng liên quan, điều kiện phát sinh và trạng thái xử lý. Sau khi lỗi được sửa, chức năng tương ứng được kiểm thử lại nhằm xác nhận lỗi đã được khắc phục. 

Có thể phân loại: 

Critical – High – Medium – Low. 

## **6.2.11. Tiêu chí hoàn thành kiểm thử** 

Hệ thống được xem là đáp ứng yêu cầu kiểm thử khi: 

- Các luồng nghiệp vụ chính hoạt động đúng theo đặc tả Use Case. 

   - Không còn lỗi nghiêm trọng làm gián đoạn hệ thống. 

- Cơ chế phân quyền hoạt động đúng giữa Quản trị viên, Ứng viên và Nhà tuyển dụng. 

96 

   - Các ràng buộc dữ liệu quan trọng được kiểm soát. 

- Frontend, Backend và Database hoạt động ổn định khi tích hợp. 

- Các chức năng Workspace, Task, nghiệm thu, đánh giá và thanh toán thực hiện đúng thứ tự nghiệp vụ. 

- Hệ thống hoạt động ổn định trên các trình duyệt nằm trong phạm vi hỗ trợ. 

97 

## **CHƯƠNG 7: KẾT QUẢ DỰ KIẾN VÀ HƯỚNG PHÁT TRIỂN** 

## **7.1 Kết quả dự kiến:** 

Sau quá trình phân tích, thiết kế, xây dựng và kiểm thử, đề tài dự kiến hoàn thiện một nền tảng Web hỗ trợ kết nối việc làm và quản lý nhân sự Công nghệ thông tin theo mô hình Freelance, Part-time và Remote. Hệ thống không chỉ đóng vai trò là một cổng tuyển dụng mà còn tích hợp quy trình quản lý dự án nội bộ của đơn vị chủ quản, từ tuyển chọn ứng viên đến giao việc, theo dõi tiến độ, nghiệm thu, đánh giá năng lực và thanh toán thù lao. 

Kết quả dự kiến của đề tài được thể hiện trên các phương diện sau: 

## **7.1.1. Hoàn thiện nền tảng quản lý tài khoản và phân quyền** 

Hệ thống dự kiến xây dựng đầy đủ cơ chế quản lý tài khoản và phân quyền theo mô hình RBAC, bảo đảm các nhóm người dùng chỉ được truy cập các chức năng phù hợp với vai trò của mình. 

Ba nhóm người dùng chính gồm: 

- Quản trị viên/Chủ website: quản lý toàn bộ hệ thống, tuyển dụng dự án nội bộ, Workspace, Task, đánh giá và thanh toán. 

- Người tìm việc/Ứng viên/Freelancer: xây dựng hồ sơ năng lực, tìm kiếm việc làm, ứng tuyển và tham gia các dự án nội bộ khi được tuyển chọn. 

- Nhà tuyển dụng/Doanh nghiệp đối tác: quản lý doanh nghiệp, đăng tin tuyển dụng, tìm kiếm ứng viên và xử lý hồ sơ ứng tuyển. 

Cơ chế phân quyền dự kiến được kiểm soát tại Backend nhằm hạn chế việc người dùng truy cập hoặc thực hiện các thao tác ngoài phạm vi được cấp phép. 

## **7.1.2. Hoàn thiện hồ sơ năng lực dành cho nhân sự IT** 

Hệ thống dự kiến cung cấp cho Người tìm việc khả năng xây dựng và quản lý hồ sơ năng lực chuyên ngành Công nghệ thông tin với các thông tin như kỹ năng, kinh nghiệm, GitHub, Portfolio và các thông tin cá nhân cần thiết. 

98 

Bên cạnh các dữ liệu do ứng viên tự khai báo, hệ thống còn lưu lại kết quả đánh giá từ các dự án nội bộ mà ứng viên đã thực sự tham gia. Điểm đánh giá và lịch sử dự án này được hệ thống quản lý và ứng viên không thể tự chỉnh sửa. 

## **7.1.3. Hoàn thiện chức năng tuyển dụng và ứng tuyển** 

Nền tảng dự kiến hỗ trợ đầy đủ các chức năng cơ bản của một hệ thống tuyển dụng nhân sự IT, bao gồm: 

- Đăng và quản lý tin tuyển dụng. 

- Tìm kiếm việc làm và dự án. 

- Lọc tin theo kỹ năng, mức thù lao, hình thức làm việc và các tiêu chí liên quan. 

   - Ứng tuyển trực tuyến. 

- Quản lý hồ sơ ứng tuyển. 

- Theo dõi trạng thái và lịch sử xử lý hồ sơ. 

- Tìm kiếm ứng viên theo kỹ năng, kinh nghiệm và điểm năng lực. 

Hệ thống đồng thời phân biệt rõ hai loại tin tuyển dụng: tin phục vụ dự án nội bộ của Chủ website và tin tuyển dụng do doanh nghiệp đối tác đăng tải. 

## **7.1.4. Hoàn thiện quy trình quản lý dự án nội bộ** 

Đối với các dự án do Chủ website tổ chức, hệ thống dự kiến hình thành một quy trình quản lý tương đối khép kín: 

Tạo dự án → đăng tin tuyển dụng → tiếp nhận hồ sơ → lựa chọn ứng viên → tạo Workspace → thêm thành viên → phân công Task → cập nhật tiến độ → nộp sản phẩm → nghiệm thu → đánh giá năng lực → thanh toán thù lao. 

Workspace đóng vai trò là môi trường làm việc tập trung cho từng dự án. Quản trị viên có thể theo dõi thành viên và tiến độ công việc, trong khi Freelancer có thể xem các Task được phân công, cập nhật tiến độ và gửi sản phẩm hoàn thành. 

## **7.1.5. Hoàn thiện chức năng nghiệm thu và đánh giá năng lực** 

Sau khi Freelancer hoàn thành công việc, hệ thống dự kiến hỗ trợ quá trình nộp sản phẩm và nghiệm thu. 

99 

Trong trường hợp kết quả chưa đạt yêu cầu, Quản trị viên có thể yêu cầu chỉnh sửa và ứng viên thực hiện nộp lại sản phẩm. Khi công việc hoặc dự án đạt yêu cầu, Quản trị viên tiến hành đánh giá năng lực bằng điểm số và nhận xét. 

Kết quả đánh giá sau đó được ghi nhận vào hồ sơ năng lực của Freelancer và được sử dụng làm dữ liệu để tổng hợp điểm năng lực trên hệ thống. 

Qua đó, hệ thống tạo ra mối liên kết giữa: kết quả làm việc thực tế → đánh giá → hồ sơ năng lực → cơ hội tuyển dụng tiếp theo. 

## **7.1.6. Hoàn thiện chức năng thanh toán thù lao** 

Hệ thống dự kiến hỗ trợ quản lý thông tin nhận tiền của Freelancer và thực hiện quy trình chi trả thù lao sau khi công việc đáp ứng điều kiện nghiệm thu. 

Thông tin giao dịch, số tiền, phương thức và trạng thái thanh toán được lưu lại để cả Quản trị viên và Freelancer có thể theo dõi. 

Trong quá trình phát triển và kiểm thử, việc tích hợp thanh toán có thể thực hiện thông qua môi trường thử nghiệm hoặc cơ chế mô phỏng nhằm bảo đảm an toàn trước khi triển khai trên môi trường thực tế. 

## **7.1.7. Hoàn thiện chức năng thống kê và báo cáo** 

Hệ thống dự kiến cung cấp các chức năng thống kê phục vụ quản trị, bao gồm: 

- Số lượng người dùng và hồ sơ ứng viên. 

- Số lượng doanh nghiệp đối tác. 

- Tình hình tuyển dụng. 

- Số lượng hồ sơ ứng tuyển. 

- Tiến độ các dự án nội bộ. 

- Tình trạng Task. 

- Kết quả đánh giá Freelancer. 

- Chi phí và trạng thái thanh toán. 

Một số dữ liệu có thể được trình bày trực tiếp trên giao diện hoặc kết xuất dưới dạng Excel/PDF theo yêu cầu quản lý. 

100 

## **7.1.8. Kết quả về mặt kỹ thuật** 

Về mặt kỹ thuật, đề tài dự kiến hoàn thiện một hệ thống Web theo mô hình Client– Server với các thành phần chính: 

- Frontend xây dựng bằng React. 

- Backend xây dựng bằng Node.js và Express.js. 

- Giao tiếp giữa Frontend và Backend thông qua RESTful API. 

- Cơ sở dữ liệu sử dụng PostgreSQL. 

   - Xác thực và phân quyền được tổ chức theo JWT và RBAC. 

- Git được sử dụng để quản lý phiên bản mã nguồn. 

## **7.1.9. Kết quả về mặt học thuật** 

Thông qua quá trình thực hiện đề tài, nhóm dự kiến vận dụng các kiến thức của chuyên ngành Công nghệ phần mềm vào một quy trình phát triển hệ thống tương đối đầy đủ, bao gồm: 

- Phân tích bài toán và yêu cầu nghiệp vụ. 

- Xây dựng Use Case và đặc tả chức năng. 

- Thiết kế kiến trúc hệ thống. 

- Thiết kế cơ sở dữ liệu. 

- Thiết kế giao diện. 

- Xây dựng Frontend và Backend. 

- Phân quyền và bảo vệ dữ liệu. 

- Tích hợp các thành phần hệ thống. 

- Lập kế hoạch triển khai. 

   - Xây dựng phương án kiểm thử. 

Qua đó, sản phẩm cuối cùng không chỉ là một website có thể vận hành mà còn thể hiện quá trình áp dụng có hệ thống các kiến thức và phương pháp của lĩnh vực Công nghệ phần mềm. 

101 

## **7.2 Hướng phát triển:** 

## **7.2.1. Phát triển hệ thống Chat nội bộ** 

Hệ thống có thể bổ sung chức năng Chat để hỗ trợ trao đổi trực tiếp giữa Quản trị viên, thành viên dự án và các đối tượng có liên quan. 

Đối với Workspace, Chat có thể được tổ chức theo từng dự án hoặc từng Task, giúp hạn chế việc người dùng phải trao đổi qua các công cụ bên ngoài và tăng mức độ khép kín của quy trình quản lý dự án. 

## **7.2.2. Tích hợp phỏng vấn trực tuyến** 

Một hướng phát triển khác là tích hợp chức năng Video Call hoặc liên kết với các nền tảng họp trực tuyến để hỗ trợ phỏng vấn ứng viên ngay trên hệ thống. 

Khi đó, Nhà tuyển dụng hoặc Quản trị viên có thể lên lịch phỏng vấn, gửi lời mời và quản lý kết quả phỏng vấn trực tiếp trong quy trình xử lý hồ sơ. 

## **7.2.3. Mở rộng hệ thống gợi ý việc làm và ứng viên** 

Khi lượng dữ liệu người dùng tăng lên, có thể phát triển cơ chế gợi ý nhằm hỗ trợ: 

- Đề xuất công việc phù hợp cho ứng viên dựa trên kỹ năng và kinh nghiệm. 

- Đề xuất ứng viên phù hợp với yêu cầu của tin tuyển dụng. 

- Ưu tiên ứng viên có lịch sử dự án và điểm năng lực phù hợp. 

- Phân tích mức độ tương thích giữa hồ sơ và yêu cầu tuyển dụng. 

## **7.2.4 Hoàn thiện hệ thống đánh giá năng lực** 

Cơ chế đánh giá có thể được mở rộng từ một điểm tổng hợp thành nhiều tiêu chí riêng biệt, chẳng hạn: về chất lượng sản phẩm, mức độ hoàn thành đúng hạn, kỹ năng chuyên môn, khả năng phối hợp, tính chủ động trong công việc, .. 

Việc đánh giá theo nhiều tiêu chí sẽ giúp hồ sơ năng lực phản ánh chi tiết hơn năng lực thực tế của Freelancer. 

Trong tương lai, hệ thống cũng có thể xây dựng lịch sử thay đổi điểm năng lực và biểu đồ thể hiện sự phát triển của ứng viên qua nhiều dự án. 

102 

## **7.2.5. Mở rộng quy mô doanh nghiệp và người dùng** 

Khi số lượng doanh nghiệp, ứng viên và dự án tăng lên, hệ thống có thể tiếp tục được tối ưu về kiến trúc và cơ sở hạ tầng để đáp ứng quy mô lớn hơn. 

103 

