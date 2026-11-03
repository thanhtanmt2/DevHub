import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { AvatarWithMedal, apiMessage, compactNumber, memberTitle } from '@/components/forum/ForumParts';
import useEscapeKey from '@/hooks/useEscapeKey';
import { timeAgo } from '@/utils/timeAgo';

const ONLINE_WINDOW = 5 * 60 * 1000; // vừa hoạt động trong 5 phút thì coi là đang trực tuyến

const Stat = ({ label, value, title }) => (
  <div className="px-2 text-center" title={title}>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-0.5 text-lg font-extrabold text-slate-900 leading-tight">{value}</p>
  </div>
);

// Khung thông tin thành viên (kiểu voz): mở khi bấm vào ảnh đại diện / tên ở cạnh bài viết.
// Ảnh bên trái, thông tin bên phải (tên, danh xưng, ngày tham gia, lần cuối trực tuyến), hàng số liệu và các nút Theo dõi / Bỏ qua / Gửi tin nhắn.
export default function MemberCard({ userId, onClose }) {
  useEscapeKey(onClose);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const { user, openLoginModal } = useAuth();
  const key = ['forum-member', userId, user?.id ?? 'guest'];
  const { data: m, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => forumApi.getMember(userId).then((r) => r.data.data),
    retry: false,
  });

  // Cập nhật ngay trạng thái theo dõi / bỏ qua trên khung, rồi làm mới các danh sách chịu ảnh hưởng (bài bị ẩn, chủ đề của người bị bỏ qua)
  const afterToggle = (res) => {
    toast.success(res.data.message);
    qc.setQueryData(key, (old) => (old ? { ...old, viewer: { ...old.viewer, ...res.data.data } } : old));
    qc.invalidateQueries({ queryKey: ['forum-thread'] });
    qc.invalidateQueries({ queryKey: ['forum-threads'] });
    qc.invalidateQueries({ queryKey: ['forum-overview'] });
  };
  const follow = useMutation({ mutationFn: () => forumApi.toggleFollow(userId), onSuccess: afterToggle, onError: (err) => toast.error(apiMessage(err, 'Chưa thực hiện được')) });
  const ignore = useMutation({ mutationFn: () => forumApi.toggleIgnore(userId), onSuccess: afterToggle, onError: (err) => toast.error(apiMessage(err, 'Chưa thực hiện được')) });

  const needLogin = () => { onClose(); openLoginModal(); };
  const onFollow = () => (user ? follow.mutate() : needLogin());
  const onIgnore = async () => {
    if (!user) return needLogin();
    if (m.viewer?.ignored) return ignore.mutate();
    const ok = await confirm({
      title: `Bỏ qua ${m.full_name}?`,
      message: 'Bài viết và chủ đề của thành viên này sẽ được ẩn với bạn, và họ không nhắn tin cho bạn được nữa. Bạn có thể bỏ qua lại bất cứ lúc nào.',
      confirmText: 'Bỏ qua', tone: 'danger',
    });
    if (ok) ignore.mutate();
    return undefined;
  };
  const onMessage = () => { if (!user) return needLogin(); onClose(); navigate(`/forum/messages?with=${m.id}`); return undefined; };

  const viewer = m?.viewer;
  const lastSeen = m?.last_seen_at ? new Date(m.last_seen_at) : null;
  const online = !!lastSeen && Date.now() - lastSeen.getTime() < ONLINE_WINDOW;
  const row = 'flex flex-wrap items-baseline gap-x-1.5';

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Thông tin thành viên"
    >
      <div className="relative w-full max-w-[30rem] max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-fade-in">
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute top-3 right-3 w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition-colors">
          <Icon name="x" className="w-5 h-5" />
        </button>

        {isLoading ? <div className="py-16"><LoadingSpinner /></div> : error || !m ? (
          <p className="py-14 px-6 text-center text-slate-500">{error?.response?.data?.message || 'Không tải được thông tin thành viên'}</p>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Ảnh bên trái, thông tin bên phải */}
            <div className="flex gap-4">
              <span className="self-start flex-shrink-0"><AvatarWithMedal author={m} size="xl" className="!w-20 !h-20 !text-3xl ring-4 ring-white shadow-lg" medalClassName="w-7 h-7" /></span>
              <div className="min-w-0 flex-1 pr-7">
                <h2 className="text-lg font-extrabold leading-tight text-primary-700 break-words">{m.full_name}</h2>
                <p className={`mt-0.5 text-sm break-words ${m.role === 'ADMIN' ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{memberTitle(m)}</p>
                <dl className="mt-2.5 space-y-1 text-[13px] text-slate-600">
                  <div className={row}><dt className="text-slate-500">Đã tham gia:</dt><dd className="font-semibold text-slate-800">{new Date(m.joined_at).toLocaleDateString('vi-VN')}</dd></div>
                  <div className={row}>
                    <dt className="text-slate-500">Lần cuối trực tuyến:</dt>
                    <dd className="font-semibold text-slate-800">
                      {online
                        ? <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" />Đang trực tuyến</span>
                        : lastSeen ? timeAgo(lastSeen) : 'Chưa rõ'}
                    </dd>
                  </div>
                  {m.watching && (
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <dt className="text-slate-500 flex-shrink-0">Đang xem chủ đề</dt>
                      <dd className="min-w-0"><Link to={`/forum/t/${m.watching.id}`} onClick={onClose} title={m.watching.title} className="block truncate font-semibold text-primary-700 hover:underline">{m.watching.title}</Link></dd>
                    </div>
                  )}
                  {m.rank && (
                    <div className={row}>
                      <dt className="text-slate-500">Dự án DevHub:</dt>
                      <dd className="font-semibold text-slate-800">{m.rank.completed_projects} hoàn thành{m.rank.avg_score ? ` · TB ${m.rank.avg_score}/10 (${m.rank.grade})` : ''}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Số liệu */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-100 py-3">
              <Stat label="Bài viết" value={compactNumber(m.post_count)} />
              <Stat
                label="Điểm cảm xúc"
                value={m.reaction_score < 0 ? `−${compactNumber(-m.reaction_score)}` : compactNumber(m.reaction_score)}
                title={`${m.likes_received} lượt thích − ${m.dislikes_received} lượt không thích nhận được ở diễn đàn chung`}
              />
              {m.rank
                ? <Stat label="Điểm" value={compactNumber(m.rank.points)} title="Điểm tích lũy từ các dự án DevHub" />
                : <Stat label="Chủ đề" value={compactNumber(m.thread_count)} />}
            </div>

            {/* Thao tác */}
            {viewer?.is_self ? (
              <p className="mt-4 text-center text-sm text-slate-500">Đây là thông tin diễn đàn của bạn.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onFollow}
                  disabled={follow.isPending}
                  className={viewer?.following ? 'whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-60' : 'btn-primary text-sm whitespace-nowrap !gap-1.5 !px-2.5'}
                  title={viewer?.following ? 'Bấm để bỏ theo dõi' : 'Được báo khi thành viên này mở chủ đề mới'}
                >
                  <Icon name={viewer?.following ? 'check' : 'userPlus'} className="w-4 h-4" />{viewer?.following ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
                <button
                  type="button"
                  onClick={onIgnore}
                  disabled={ignore.isPending || viewer?.can_ignore === false}
                  title={viewer?.can_ignore === false ? 'Không thể bỏ qua quản trị viên' : viewer?.ignored ? 'Bấm để hiện lại bài viết của thành viên này' : 'Ẩn bài viết của thành viên này'}
                  className={viewer?.ignored ? 'whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100 transition-colors disabled:opacity-60' : 'btn-secondary text-sm whitespace-nowrap !gap-1.5 !px-2.5'}
                >
                  <Icon name="ban" className={`w-4 h-4 ${viewer?.ignored ? '' : 'text-slate-400'}`} />{viewer?.ignored ? 'Đã bỏ qua' : 'Bỏ qua'}
                </button>
                <button
                  type="button"
                  onClick={onMessage}
                  disabled={!!viewer && !viewer.can_message}
                  title={viewer && !viewer.can_message ? 'Thành viên này không nhận tin nhắn từ bạn' : 'Gửi tin nhắn riêng'}
                  className="btn-secondary text-sm whitespace-nowrap !gap-1.5 !px-2.5 col-span-2 sm:col-span-1"
                >
                  <Icon name="send" className="w-4 h-4 text-sky-600" />Gửi tin nhắn
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={!m.thread_count}
              onClick={() => { onClose(); navigate(`/forum?author=${m.id}`); }}
              className="mt-3 w-full text-center text-sm font-semibold text-primary-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-default"
            >
              {m.thread_count ? `Xem ${m.thread_count} chủ đề của thành viên` : 'Thành viên chưa mở chủ đề nào'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
