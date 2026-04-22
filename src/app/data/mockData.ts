// 模拟数据
export interface Cat {
  id: string;
  name: string;
  nickname: string;
  gender: '公' | '母';
  color: string;
  personality: string[];
  health: string;
  neutered: boolean;
  image: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface CheckInRecord {
  id: string;
  catId: string;
  catName: string;
  userId: string;
  userName: string;
  type: 'encounter' | 'feeding';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  image: string;
  comment: string;
  timestamp: string;
  likes: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  checkInCount: number;
  feedingCount: number;
  favorites: string[];
}

// 模拟猫咪数据
export const mockCats: Cat[] = [
  {
    id: '1',
    name: '橘猫001',
    nickname: '小橘',
    gender: '公',
    color: '橘色',
    personality: ['亲人', '活泼'],
    health: '健康',
    neutered: true,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    description: '图书馆常驻小可爱,喜欢晒太阳',
    location: {
      lat: 31.9132,
      lng: 118.7811,
      name: '河海大学江宁校区图书馆门口'
    }
  },
  {
    id: '2',
    name: '狸花002',
    nickname: '小花',
    gender: '母',
    color: '狸花色',
    personality: ['社恐', '高冷'],
    health: '健康',
    neutered: true,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    description: '教学楼附近的小公主,比较害羞',
    location: {
      lat: 31.9141,
      lng: 118.7801,
      name: '河海大学江宁校区第一教学楼'
    }
  },
  {
    id: '3',
    name: '黑白003',
    nickname: '奶牛',
    gender: '公',
    color: '黑白相间',
    personality: ['亲人', '贪吃'],
    health: '健康',
    neutered: false,
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    description: '食堂附近的小吃货,见到人就跑过来',
    location: {
      lat: 31.9125,
      lng: 118.7817,
      name: '河海大学江宁校区学生食堂'
    }
  },
  {
    id: '4',
    name: '白猫004',
    nickname: '雪球',
    gender: '母',
    color: '纯白色',
    personality: ['温顺', '安静'],
    health: '健康',
    neutered: true,
    image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400',
    description: '体育馆旁边的小仙女,喜欢在草地上打滚',
    location: {
      lat: 31.912,
      lng: 118.7795,
      name: '河海大学江宁校区体育馆'
    }
  },
  {
    id: '5',
    name: '三花005',
    nickname: '小三',
    gender: '母',
    color: '三花色',
    personality: ['活泼', '调皮'],
    health: '健康',
    neutered: true,
    image: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=400',
    description: '宿舍楼下的小淘气,喜欢跟人玩',
    location: {
      lat: 31.9148,
      lng: 118.7816,
      name: '河海大学江宁校区学生宿舍区'
    }
  }
];

// 模拟打卡记录
export const mockCheckIns: CheckInRecord[] = [
  {
    id: '1',
    catId: '1',
    catName: '小橘',
    userId: 'u1',
    userName: '张三',
    type: 'feeding',
    location: {
      lat: 31.9132,
      lng: 118.7811,
      name: '河海大学江宁校区图书馆门口'
    },
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    comment: '今天给小橘喂了猫粮,吃得好开心!',
    timestamp: '2026-04-21 14:30',
    likes: 15
  },
  {
    id: '2',
    catId: '2',
    catName: '小花',
    userId: 'u2',
    userName: '李四',
    type: 'encounter',
    location: {
      lat: 31.9141,
      lng: 118.7801,
      name: '河海大学江宁校区第一教学楼'
    },
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    comment: '偶遇小花,还是那么高冷',
    timestamp: '2026-04-21 10:15',
    likes: 8
  },
  {
    id: '3',
    catId: '3',
    catName: '奶牛',
    userId: 'u1',
    userName: '张三',
    type: 'feeding',
    location: {
      lat: 31.9125,
      lng: 118.7817,
      name: '河海大学江宁校区学生食堂'
    },
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400',
    comment: '奶牛又来蹭饭了哈哈',
    timestamp: '2026-04-20 12:00',
    likes: 23
  }
];

// 模拟用户数据
export const mockUser: User = {
  id: 'u1',
  name: '张三',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  role: 'user',
  checkInCount: 25,
  feedingCount: 18,
  favorites: ['1', '3']
};

// 统计数据
export const mockStats = {
  totalCats: 42,
  totalCheckIns: 326,
  totalFeedings: 189,
  activeCats: 38,
  topLocation: '河海大学江宁校区图书馆门口',
  topCat: '小橘'
};
